use crate::{start_server, Result};
use inspector_protocol_primitives::InspectorBuilder;
use jsonrpsee::server::ServerHandle;
use std::net::SocketAddr;

pub async fn server_mock() -> Result<(SocketAddr, ServerHandle)> {
	start_server(
		InspectorBuilder::new().build(tauri::test::mock_app().handle(), 100),
		Default::default(),
	)
	.await
}
