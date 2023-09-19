use crate::Result;
use inspector_protocol_primitives::{Inspector, Runtime};
use jsonrpsee::{types::error::ErrorCode, RpcModule};

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Inspector<'static, R>>) -> Result<()> {
	module.register_method("performance_getMetrics", |_, inspector| {
		serde_json::to_value(inspector.metrics.as_ref()).map_err(|_| ErrorCode::InternalError)
	})?;

	Ok(())
}

#[cfg(test)]
mod tests {
	use crate::{mock::server_mock, Result};

	#[tokio::test]
	async fn performance_methods() -> Result<()> {
		let (_addr, handle) = server_mock().await?;

		// FIXME: add extensive tests with a client?

		handle.stop()?;
		Ok(())
	}
}
