use crate::{context::Context, error::Result};
use inspector_protocol_primitives::{EntryT, Runtime};
use jsonrpsee::{types::error::ErrorCode, RpcModule};

pub(crate) fn module<R: Runtime, L: EntryT, S: EntryT>(module: &mut RpcModule<Context<R, L, S>>) -> Result<()> {
	module.register_method("performance_getMetrics", |_, inspector| {
		serde_json::to_value(inspector.metrics.as_ref()).map_err(|_| ErrorCode::InternalError)
	})?;

	Ok(())
}

#[cfg(test)]
mod tests {
	use crate::{context::ContextMetrics, error::Result, mock::ws_client_with_server};
	use inspector_protocol_primitives::now;
	use jsonrpsee_core::{client::ClientT, rpc_params};

	#[tokio::test]
	async fn performance_get_metrics() -> Result<()> {
		let current_time = now();
		let (client, handle) = ws_client_with_server().await?;
		let received_metrics: ContextMetrics = client.request("performance_getMetrics", rpc_params![]).await.unwrap();
		assert!(received_metrics.initialized_at >= current_time);
		handle.abort();
		Ok(())
	}
}
