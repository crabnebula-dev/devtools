use crate::{Inspector, Result};
use inspector_protocol_macro::rpc;
use inspector_protocol_primitives::{LogEntry, Runtime};
use jsonrpsee::types::error::ErrorCode;
use std::sync::Arc;
use tokio_stream::wrappers::BroadcastStream;

pub struct LogsApi;

#[rpc(namespace = "logs")]
impl LogsApi {
	/// Subscribe to log events
	#[subscription(subscribe = "watch", notif = "added", unsubscribe = "unwatch")]
	fn logs<R: Runtime>(
		inspector: Arc<Inspector<'static, R>>,
	) -> Result<BroadcastStream<Vec<LogEntry<'_>>>, ErrorCode> {
		Ok(BroadcastStream::new(inspector.logs()))
	}
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
