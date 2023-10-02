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

#[cfg(test)]
mod tests {
	use crate::test_util::setup_ws_client_and_server;
	use jsonrpsee_core::{client::ClientT, rpc_params};
	use tauri_devtools_shared::now;
	use tauri_devtools_shared::Metrics;
	use tokio::sync::broadcast;

	#[tokio::test]
	async fn performance_get_metrics() -> crate::Result<()> {
		let (logs_tx, _) = broadcast::channel(100);
		let (spans_tx, _) = broadcast::channel(100);

		let current_time = now();
		let (client, handle) = setup_ws_client_and_server(logs_tx, spans_tx).await?;
		let received_metrics: Metrics = client.request("performance_getMetrics", rpc_params![]).await.unwrap();

		assert!(received_metrics.initialized_at >= current_time);

		handle.abort();
		Ok(())
	}
}
