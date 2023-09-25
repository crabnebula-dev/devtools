use crate::{config::Config, context::Context, error::Result};
use inspector_protocol_primitives::{Asset, AssetParams};
use jsonrpsee::{types::error::ErrorCode, RpcModule};

/// Registers `tauri` related methods to the provided RPC module.
///
/// This module currently offers two methods:
/// - `tauri_getConfig`: Fetches the Tauri configuration and returns it as a serialized JSON value.
/// - `tauri_getAsset`: Retrieves the asset corresponding to the specified path and returns it as a serialized JSON value.
pub(crate) fn module<C: Config>(module: &mut RpcModule<Context<C>>) -> Result<()> {
	// Fetches the Tauri configuration and returns it as a serialized JSON value.
	module.register_method("tauri_getConfig", |_, inspector| {
		let tauri_config = inspector.app_handle.config();
		serde_json::to_value(tauri_config.as_ref()).map_err(|_| ErrorCode::InternalError)
	})?;

	// Retrieves the asset corresponding to the specified path and returns it as a serialized JSON value.
	module.register_method("tauri_getAsset", |maybe_params, inspector| {
		let params = maybe_params
			.parse::<AssetParams>()
			.map_err(|_| ErrorCode::InvalidParams)?;

		let asset: Asset = inspector
			.app_handle
			.asset_resolver()
			.get(params.path)
			.ok_or(ErrorCode::InvalidRequest)?
			.into();

		serde_json::to_value(asset).map_err(|_| ErrorCode::InternalError)
	})?;

	Ok(())
}

#[cfg(test)]
mod tests {
	use crate::{error::Result, mock::ws_client_with_server};
	use jsonrpsee_core::{client::ClientT, rpc_params};
	use serde_json::Value;
	use tauri::test::mock_app;

	#[tokio::test]
	async fn tauri_get_config() -> Result<()> {
		let (client, handle) = ws_client_with_server().await?;
		let expected_tauri_config =
			serde_json::to_value(mock_app().handle().config().as_ref()).expect("valid tauri config");
		let received_tauri_config: Value = client.request("tauri_getConfig", rpc_params![]).await.unwrap();

		assert_eq!(expected_tauri_config, received_tauri_config);
		handle.abort();
		Ok(())
	}
}
