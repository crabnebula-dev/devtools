use crate::Result;
use inspector_protocol_primitives::{Asset, AssetParams, Inspector, Runtime};
use jsonrpsee::{types::error::ErrorCode, RpcModule};

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Inspector<'static, R>>) -> Result<()> {
	module.register_method("tauri_getConfig", |_, inspector| {
		let tauri_config = inspector.app_handle.config();
		serde_json::to_value(tauri_config.as_ref()).map_err(|_| ErrorCode::InternalError)
	})?;

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
	use crate::{mock::server_mock, Result};

	#[tokio::test]
	async fn tauri_methods() -> Result<()> {
		let (_addr, handle) = server_mock().await?;

		// FIXME: add extensive tests with a client?

		handle.stop()?;
		Ok(())
	}
}
