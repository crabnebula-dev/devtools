use crate::server::Server;
use crate::Result;
use jsonrpsee::{types::error::ErrorCode, RpcModule};
use tauri::Runtime;
use tauri_devtools_shared::{Asset, AssetParams};

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Server<R>>) -> Result<()> {
	module.register_method("tauri_getConfig", |_, ctx| {
		let tauri_config = ctx.app_handle.config();
		serde_json::to_value(tauri_config.as_ref()).map_err(|_| ErrorCode::InternalError)
	})?;

	module.register_method("tauri_listAssets", |_, ctx| {
		let asset_resolver = ctx.app_handle.asset_resolver();
		let assets: Vec<_> = asset_resolver.iter().map(|(path, _asset)| path).collect();

		serde_json::to_value(assets).map_err(|_| ErrorCode::InternalError)
	})?;

	module.register_method("tauri_getAsset", |maybe_params, ctx| {
		let params = maybe_params
			.parse::<AssetParams>()
			.map_err(|_| ErrorCode::InvalidParams)?;

		let asset: Asset = ctx
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
	use crate::test_util::setup_ws_client_and_server;
	use jsonrpsee_core::{client::ClientT, rpc_params};
	use serde_json::Value;
	use tauri::test::mock_app;
	use tokio::sync::broadcast;

	#[tokio::test]
	async fn tauri_get_config() -> crate::Result<()> {
		let (logs_tx, _) = broadcast::channel(5);
		let (spans_tx, _) = broadcast::channel(5);

		let (client, handle) = setup_ws_client_and_server(logs_tx, spans_tx).await?;
		let expected_tauri_config =
			serde_json::to_value(mock_app().handle().config().as_ref()).expect("valid tauri config");
		let received_tauri_config: Value = client.request("tauri_getConfig", rpc_params![]).await.unwrap();

		assert_eq!(expected_tauri_config, received_tauri_config);

		handle.abort();
		Ok(())
	}
}
