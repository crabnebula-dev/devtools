use crate::Inspector;
use crate::Result;
use inspector_protocol_macro::rpc;
use inspector_protocol_primitives::{Asset, AssetParams, Runtime, TauriConfig};
use jsonrpsee::types::error::ErrorCode;

pub struct TauriApi;

#[rpc(namespace = "tauri")]
impl TauriApi {
	/// Get Tauri config
	#[method(name = "getConfig")]
	fn get_config<R: Runtime>(inspector: &Inspector<'_, R>) -> Result<TauriConfig, ErrorCode> {
		Ok(inspector.app_handle().config().into())
	}

	/// Inspect Tauri assets
	#[method(name = "getAssets")]
	fn get_assets<R: Runtime>(inspector: &Inspector<'_, R>, params: AssetParams) -> Result<Asset, ErrorCode> {
		inspector
			.app_handle()
			.asset_resolver()
			.get(params.path)
			.ok_or(ErrorCode::InvalidRequest)
			.map(|tauri_asset| tauri_asset.into())
	}
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
