use crate::Result;
use inspector_protocol_primitives::{Inspector, Runtime};
use jsonrpsee::{types::error::ErrorCode, RpcModule};

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Inspector<R>>) -> Result<()> {
	module.register_method("performance_getMetrics", |_, inspector| {
		serde_json::to_value(inspector.metrics.as_ref()).map_err(|_| ErrorCode::InternalError)
	})?;

	Ok(())
}
