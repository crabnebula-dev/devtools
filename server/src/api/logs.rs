use super::{parse_subscription_filter, pipe_from_stream_with_bounded_buffer};
use crate::{context::Context, error::Result};
use inspector_protocol_primitives::{EntryT, Runtime};
use jsonrpsee::RpcModule;
use tokio_stream::wrappers::BroadcastStream;

pub(crate) fn module<R: Runtime, L: EntryT, S: EntryT>(module: &mut RpcModule<Context<R, L, S>>) -> Result<()> {
	module.register_subscription(
		"logs_watch",
		"logs_added",
		"logs_unwatch",
		|maybe_params, pending, inspector| async move {
			let filter = parse_subscription_filter(maybe_params);
			let channel = inspector.channels.logs.subscribe();
			let stream = BroadcastStream::new(channel);
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
	async fn logs_subscription() -> Result<()> {
		const ENTRIES_BY_BROADCAST: usize = 10;
		let (sender, _) = broadcast::channel(5);
		let channel = sender.clone();

		let (client, handle) = ws_client_with_server_with_channel(&channel).await?;
		let mut test_sub: Subscription<Vec<MockEntry>> =
			client.subscribe("logs_watch", rpc_params![], "logs_unwatch").await?;

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
