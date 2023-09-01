use super::pipe_from_stream_with_bounded_buffer;
use crate::Result;
use inspector_protocol_primitives::{Inspector, Runtime};
use jsonrpsee::RpcModule;
use tokio_stream::wrappers::BroadcastStream;

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Inspector<R>>) -> Result<()> {
	module.register_subscription(
		"logs_watch",
		"logs_added",
		"logs_unwatch",
		|_, pending, inspector| async move {
			let channel = inspector.channels.logs.subscribe();
			let stream = BroadcastStream::new(channel);
			pipe_from_stream_with_bounded_buffer(pending, stream).await?;
			Ok(())
		},
	)?;

	Ok(())
}
