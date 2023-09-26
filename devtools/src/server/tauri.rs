use crate::Result;
use tauri_devtools_shared::{Asset, AssetParams};
use jsonrpsee::{types::error::ErrorCode, RpcModule};
use tauri::Runtime;
use crate::server::Server;

pub(crate) fn module<R: Runtime>(module: &mut RpcModule<Server<R>>) -> Result<()> {
    module.register_method("tauri_getConfig", |_, ctx| {
        let tauri_config = ctx.app_handle.config();
        serde_json::to_value(tauri_config.as_ref()).map_err(|_| ErrorCode::InternalError)
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
