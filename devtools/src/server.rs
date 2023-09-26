use ::tauri::{AppHandle, Runtime};
use futures::{future, future::Either, StreamExt};
use jsonrpsee::server::{ServerBuilder, ServerHandle};
use jsonrpsee::types::Params;
use jsonrpsee_core::id_providers::RandomStringIdProvider;
use jsonrpsee_core::server::{PendingSubscriptionSink, RpcModule, SubscriptionMessage};
use jsonrpsee_core::Serialize;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::sync::{Arc, Mutex};
use tauri_devtools_shared::{Filter, Filterable, LogEntry, Metrics, SpanEntry, SubscriptionParams};
use tokio::sync::broadcast;
use tokio_stream::wrappers::BroadcastStream;

mod logs;
mod performance;
mod spans;
mod tauri;

pub(crate) struct Server<R: Runtime> {
	logs: broadcast::Sender<Vec<LogEntry>>,
	spans: broadcast::Sender<Vec<SpanEntry>>,
	app_handle: AppHandle<R>,
	metrics: Arc<Mutex<Metrics>>,
}

impl<R: Runtime> Server<R> {
	const DEFAULT_ADDRESS: SocketAddr = SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 3000);

	pub fn new(
		logs: broadcast::Sender<Vec<LogEntry>>,
		spans: broadcast::Sender<Vec<SpanEntry>>,
		app_handle: AppHandle<R>,
		metrics: Arc<Mutex<Metrics>>,
	) -> Self {
		Self {
			logs,
			spans,
			app_handle,
			metrics,
		}
	}
	pub async fn run(self) -> crate::Result<(SocketAddr, ServerHandle)> {
		// Important
		// - denies HTTP requests which isn't a WS upgrade request
		// - include additional methods from `inject_additional_rpc_methods`
		let builder = ServerBuilder::new()
			.ws_only()
			.ping_interval(std::time::Duration::from_secs(30))
			.set_id_provider(RandomStringIdProvider::new(16));

		let server = builder.build(&Self::DEFAULT_ADDRESS).await?;
		let server_addr = server.local_addr()?;
		let handle = server.start(self.assemble_rpc_apis()?);

		Ok((server_addr, handle))
	}

	fn assemble_rpc_apis(self) -> crate::Result<RpcModule<Self>> {
		let mut module = RpcModule::new(self);

		// register `spans_*` methods
		spans::module(&mut module)?;

		// register `logs_*` methods
		logs::module(&mut module)?;

		// register `tauri_*` methods
		tauri::module(&mut module)?;

		// register `performance_*` methods
		performance::module(&mut module)?;

		let mut available_methods = module.method_names().collect::<Vec<_>>();
		available_methods.sort();

		module
			.register_method("rpc_methods", move |_, _| {
				serde_json::json!({
					"methods": available_methods,
				})
			})
			.expect("infallible all other methods have their own address space; qed");

		Ok(module)
	}
}

/// Parses the subscription filter from the given JSON-RPC [`Params`].
///
/// This function tries to parse the JSON-RPC parameters into a `SubscriptionParams`
/// and extracts the `Filter` object, if it exists. If parsing fails, or if the
/// parameters are not in object form, it returns `None`.
///
/// # Parameters
///
/// - `maybe_params`: The JSON-RPC [`Params`] object that might contain a filter.
///
/// # Returns
///
/// An `Option<Filter>` that contains the filter if parsing is successful.
pub(super) fn parse_subscription_filter(maybe_params: Params<'_>) -> Option<Filter> {
	if maybe_params.is_object() {
		maybe_params
			.parse::<SubscriptionParams>()
			.ok()
			.map(|params| params.filter)
	} else {
		None
	}
}

/// Pipes messages from a broadcast channel to a WebSocket stream with bounded buffering.
///
/// This function transforms each event received from a `BroadcastStream` into a WebSocket message.
/// Upon receiving a new event from the broadcast channel, it gets sent to all subscribers of the WebSocket.
/// If the internal buffer of the WebSocket becomes full, this function will block until there's space available.
///
/// The transformation supports any type `T` that implements `Clone`, `Send`, `Serialize`, and has a static lifetime.
/// The transformed message will then be serialized using the `Serialize` trait.
///
/// This function handles three major scenarios:
/// 1. The WebSocket subscription gets closed: This function will then terminate.
/// 2. A new item is received from the stream: This item will be transformed into a WebSocket message.
/// 3. An error occurs during the transformation or any other stage: The error will be returned.
///
/// # Parameters
///
/// * `pending`: The pending WebSocket subscription which will be accepted to start the messaging.
/// * `stream`: The source of events, represented as a `BroadcastStream<T>`.
///
/// # Returns
///
/// This function returns a `Result` which is an `Ok(())` if the process completes without errors
/// or an `Err` wrapping the encountered error.
///
/// # Notes
///
/// In the event that the WebSocket's internal buffer is full, this function will block until space becomes available.
/// If the most recent item's delivery is critical upon its production, a smarter buffering or delivery approach might be needed.
async fn pipe_from_stream_with_bounded_buffer<T: 'static + Clone + Send + Serialize + Filterable>(
	pending: PendingSubscriptionSink,
	stream: BroadcastStream<Vec<T>>,
	maybe_filter: Option<Filter>,
) -> crate::Result<()> {
	let sink = pending.accept().await?;
	let closed = sink.closed();

	futures::pin_mut!(closed, stream);

	loop {
		match future::select(closed, stream.next()).await {
			// subscription closed.
			Either::Left((_, _)) => break Ok(()),

			// received new item from the stream.
			Either::Right((Some(Ok(item)), c)) => {
				let maybe_filtered = if let Some(filter) = &maybe_filter {
					// filter entries that matches the provided filter
					item.into_iter().filter(|item| item.match_filter(filter)).collect()
				} else {
					item
				};

				let notif = SubscriptionMessage::from_json(&maybe_filtered)?;

				// NOTE: this will block until there a spot in the queue
				if sink.send(notif).await.is_err() {
					break Ok(());
				}

				closed = c;
			}

			// Send back back the error.
			Either::Right((Some(Err(e)), _)) => break Err(e.into()),

			// Stream is closed.
			Either::Right((None, _)) => break Ok(()),
		}
	}
}

#[cfg(test)]
mod tests {
	use super::*;
	use api::Level;

	#[test]
	fn parse_level_from_params() {
		let value = Some(r#"{"filter": {"level": "INFO"}}"#);
		let valid_params = Params::new(value);
		let parsed = parse_subscription_filter(valid_params);
		assert!(parsed.is_some());
		assert_eq!(parsed.unwrap().level, Some(Level::INFO));
	}

	#[test]
	fn parse_multiple_params() {
		let value = Some(r#"{"filter": {"level": "trAce", "text": "target"}}"#);
		let valid_params = Params::new(value);
		let parsed = parse_subscription_filter(valid_params);

		assert!(parsed.as_ref().is_some());
		let filter = parsed.as_ref().expect("qed; pre-check");

		assert_eq!(filter.level, Some(Level::TRACE));
		assert_eq!(filter.text, Some("target".to_string()));
	}

	#[test]
	fn parse_invalid_params() {
		let value = Some(r#"{"filter": {"not": "valid"}}"#);
		let invalid_params = Params::new(value);
		let parsed = parse_subscription_filter(invalid_params);

		assert!(parsed.as_ref().is_some());
		let filter = parsed.as_ref().expect("qed; pre-check");

		assert!(filter.file.is_none());
		assert!(filter.level.is_none());
		assert!(filter.text.is_none());
	}

	#[test]
	fn parse_empty_params() {
		let value = Some(r#"{}"#);
		let empty_params = Params::new(value);
		assert!(parse_subscription_filter(empty_params).is_none());
	}
}
