use super::{parse_subscription_filter, pipe_from_stream_with_bounded_buffer};
use crate::server::Server;
use crate::Result;
use jsonrpsee::RpcModule;
use tauri::Runtime;
use tokio_stream::wrappers::BroadcastStream;

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Server<R>>) -> Result<()> {
	module.register_subscription(
		"logs_watch",
		"logs_added",
		"logs_unwatch",
		|maybe_params, pending, ctx| async move {
			let filter = parse_subscription_filter(maybe_params);
			let channel = ctx.logs.subscribe();
			let stream = BroadcastStream::new(channel);
			pipe_from_stream_with_bounded_buffer(pending, stream, filter).await?;
			Ok(())
		},
	)?;

	Ok(())
}

#[cfg(test)]
mod tests {
	use crate::test_util::setup_ws_client_and_server;
	use fake::{Fake, Faker};
	use jsonrpsee_core::{
		client::{Subscription, SubscriptionClientT},
		rpc_params,
	};
	use tauri_devtools_shared::LogEntry;
	use tokio::sync::broadcast;

	#[tokio::test]
	async fn logs_subscription() -> crate::Result<()> {
		let (logs_tx, _) = broadcast::channel(1);
		let (spans_tx, _) = broadcast::channel(1);

		let (client, handle) = setup_ws_client_and_server(logs_tx.clone(), spans_tx.clone()).await?;

		let mut test_sub: Subscription<Vec<LogEntry>> =
			client.subscribe("logs_watch", rpc_params![], "logs_unwatch").await?;

		let mut input: Vec<LogEntry> = vec![Faker.fake()];
		logs_tx.send(input.clone()).unwrap();

		let mut output = test_sub.next().await.expect("valid content")?;

		// FieldSet is currently not round-trip stable
		// so we ignore it
		input[0].meta.fields = Vec::new();
		output[0].meta.fields = Vec::new();

		assert_eq!(input, output);

		test_sub.unsubscribe().await?;
		handle.abort();
		Ok(())
	}
}
