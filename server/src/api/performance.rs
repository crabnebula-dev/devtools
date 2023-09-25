use crate::{config::Config, context::Context, error::Result};
use jsonrpsee::{types::error::ErrorCode, RpcModule};

/// Registers the `performance_getMetrics` method to the provided RPC module.
pub(crate) fn module<C: Config>(module: &mut RpcModule<Context<C>>) -> Result<()> {
	// Fetches metrics from the context and returns them as a serialized JSON value.
	module.register_method("performance_getMetrics", |_, context| {
		serde_json::to_value(context.metrics.as_ref()).map_err(|_| ErrorCode::InternalError)
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
