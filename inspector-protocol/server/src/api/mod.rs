use crate::{Inspector, Result};
use futures::{future, future::Either, StreamExt};
use inspector_protocol_primitives::Runtime;
use jsonrpsee::{core::server::SubscriptionMessage, PendingSubscriptionSink, RpcModule};
use serde::Serialize;
use tokio_stream::wrappers::BroadcastStream;

mod logs;
mod performance;
mod spans;
mod tauri;

/// Create new `RpcModule` with our methods
pub(crate) fn register<R: Runtime>(inspector: Inspector<'static, R>) -> Result<RpcModule<Inspector<R>>> {
	let mut module = RpcModule::new(inspector);

	// register `spans_*` methods
	spans::SpansApi::register(&mut module)?;

	// register `logs_*` methods
	logs::LogsApi::register(&mut module)?;

	// register `tauri_*` methods
	tauri::TauriApi::register(&mut module)?;

	// register `performance_*` methods
	performance::PerformanceApi::register(&mut module)?;

	Ok(module)
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
pub(crate) async fn pipe_from_stream_with_bounded_buffer<T: 'static + Clone + Send + Serialize>(
	pending: PendingSubscriptionSink,
	stream: BroadcastStream<T>,
) -> Result<()> {
	let sink = pending.accept().await?;
	let closed = sink.closed();

	futures::pin_mut!(closed, stream);

	loop {
		match future::select(closed, stream.next()).await {
			// subscription closed.
			Either::Left((_, _)) => break Ok(()),

			// received new item from the stream.
			Either::Right((Some(Ok(item)), c)) => {
				let notif = SubscriptionMessage::from_json(&item)?;

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
