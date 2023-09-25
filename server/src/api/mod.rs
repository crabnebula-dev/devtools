use crate::{config::Config, context::Context, error::Result};
use futures::{future, future::Either, StreamExt};
use inspector_protocol_primitives::{EntryT, Filter, SubscriptionParams};
use jsonrpsee::{core::server::SubscriptionMessage, types::Params, PendingSubscriptionSink, RpcModule};
use tokio_stream::wrappers::BroadcastStream;

mod logs;
mod performance;
mod spans;
mod tauri;

/// Registers various modules for handling different types of RPC methods.
///
/// This function sets up the main `RpcModule` which contains various methods
/// categorized into sub-modules. Currently, it includes methods for handling
/// spans, logs, Tauri-specific actions, and performance metrics.
pub(crate) fn register<C: Config>(context: Context<C>) -> Result<RpcModule<Context<C>>> {
	let mut module = RpcModule::new(context);

	// Register methods related to spans.
	spans::module(&mut module)?;

	// Register methods related to logs.
	logs::module(&mut module)?;

	// Register methods specific to Tauri.
	tauri::module(&mut module)?;

	// Register methods related to performance metrics.
	performance::module(&mut module)?;

	Ok(module)
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
pub(crate) async fn pipe_from_stream_with_bounded_buffer<T: EntryT>(
	pending: PendingSubscriptionSink,
	stream: BroadcastStream<Vec<T>>,
	maybe_filter: Option<Filter>,
) -> Result<()> {
	let sink = pending.accept().await?;
	let closed = sink.closed();

	futures::pin_mut!(closed, stream);

	loop {
		match future::select(closed, stream.next()).await {
			// subscription closed.
			Either::Left((_, _)) => break Ok(()),

			// received new item from the stream.
			Either::Right((Some(Ok(items)), c)) => {
				let maybe_filtered = if let Some(filter) = &maybe_filter {
					items.into_iter().filter(|item| item.match_filter(filter)).collect()
				} else {
					items
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
	use inspector_protocol_primitives::Level;

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
