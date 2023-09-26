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
