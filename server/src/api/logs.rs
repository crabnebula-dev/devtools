use super::{parse_subscription_filter, pipe_from_stream_with_bounded_buffer};
use crate::Result;
use inspector_protocol_primitives::{Inspector, Runtime};
use jsonrpsee::RpcModule;
use tokio_stream::wrappers::BroadcastStream;

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Inspector<'static, R>>) -> Result<()> {
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
	use crate::{mock::server_mock, Result};

	#[tokio::test]
	async fn logs_methods() -> Result<()> {
		let (_addr, handle) = server_mock().await?;

		// FIXME: add extensive tests with a client?

		handle.stop()?;
		Ok(())
	}
}
