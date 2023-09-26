use crate::server::Server;
use crate::Result;
use jsonrpsee::{types::error::ErrorCode, RpcModule};
use tauri::Runtime;

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Server<R>>) -> Result<()> {
	module.register_method("performance_getMetrics", |_, ctx| {
		serde_json::to_value(ctx.metrics.as_ref()).map_err(|_| ErrorCode::InternalError)
	})?;

	Ok(())
}
