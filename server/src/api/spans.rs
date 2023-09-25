use super::{parse_subscription_filter, pipe_from_stream_with_bounded_buffer};
use crate::{config::Config, context::Context, error::Result};
use jsonrpsee::RpcModule;
use tokio_stream::wrappers::BroadcastStream;

/// Registers the `spans_watch`, `spans_added`, and `spans_unwatch` methods for handling
/// span subscription in the RPC module.
///
/// These methods are used for establishing, maintaining, and ending subscriptions
/// that allow clients to receive real-time updates for new log entries.
pub(crate) fn module<C: Config>(module: &mut RpcModule<Context<C>>) -> Result<()> {
	module.register_subscription(
		"spans_watch",
		"spans_added",
		"spans_unwatch",
		|maybe_params, pending, inspector| async move {
			// Parse the filter if provided
			let filter = parse_subscription_filter(maybe_params);
			// Subscribe to the spans channel
			let channel = inspector.channels.spans.subscribe();
			// Wrap the channel in a broadcast stream
			let stream = BroadcastStream::new(channel);

			// Process the stream for the subscription.
			//
			// When the `broadcast::Receiver` receives a new event, the server emits
			// a `spans_added` method to the client. To end the subscription, the client
			// must send the `spans_unwatch` method with the subscription ID as its parameters.
			pipe_from_stream_with_bounded_buffer(pending, stream, filter).await?;
			Ok(())
		},
	)?;

	Ok(())
}

#[cfg(test)]
mod tests {
	use crate::{
		error::Result,
		mock::{mutiple_entries, ws_client_with_server_with_channel, MockEntry},
	};
	use jsonrpsee_core::{
		client::{Subscription, SubscriptionClientT},
		rpc_params,
	};
	use tokio::sync::{broadcast, oneshot};

	#[tokio::test]
	async fn spans_subscription() -> Result<()> {
		const ENTRIES_BY_BROADCAST: usize = 10;
		let (sender, _) = broadcast::channel(5);
		let channel = sender.clone();
		let (client, handle) = ws_client_with_server_with_channel(&channel).await?;
		let mut test_sub: Subscription<Vec<MockEntry>> =
			client.subscribe("spans_watch", rpc_params![], "spans_unwatch").await?;

		let (up_tx, up_rx) = oneshot::channel();
		tokio::spawn(async move {
			for _ in 0..5 {
				channel.send(mutiple_entries(ENTRIES_BY_BROADCAST)).unwrap();
			}
			up_tx.send(()).unwrap();
		})
		.await
		.unwrap();

		// wait the channel broadcast
		up_rx.await.expect("shutdown signal");

		for _ in 0..5 {
			let expected_value = test_sub.next().await.expect("valid content")?;
			assert_eq!(expected_value.len(), ENTRIES_BY_BROADCAST);
			assert_eq!(expected_value.first().unwrap().text, "hello")
		}

		test_sub.unsubscribe().await?;
		handle.abort();
		Ok(())
	}
}
