use crate::{Inspector, Result};
use inspector_protocol_macro::rpc;
use inspector_protocol_primitives::{Runtime, SpanEntry};
use jsonrpsee::types::error::ErrorCode;
use std::sync::Arc;
use tokio_stream::wrappers::BroadcastStream;

pub struct SpansApi;

#[rpc(namespace = "spans")]
impl SpansApi {
	/// Susbcribe to spans events
	#[subscription(subscribe = "watch", notif = "added", unsubscribe = "unwatch")]
	fn spans<R: Runtime>(
		inspector: Arc<Inspector<'static, R>>,
	) -> Result<BroadcastStream<Vec<SpanEntry<'_>>>, ErrorCode> {
		Ok(BroadcastStream::new(inspector.spans()))
	}
}

#[cfg(test)]
mod tests {
	use crate::{mock::server_mock, Result};

	#[tokio::test]
	async fn spans_methods() -> Result<()> {
		let (_addr, handle) = server_mock().await?;

		// FIXME: add extensive tests with a client?

		handle.stop()?;
		Ok(())
	}
}
