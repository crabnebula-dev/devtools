use crate::{start_server, Result};
use inspector_protocol_primitives::InspectorBuilder;
use jsonrpsee::server::ServerHandle;
use std::net::SocketAddr;

pub async fn server_mock() -> Result<(SocketAddr, ServerHandle)> {
	start_server(
		InspectorBuilder::new()
			.with_capacity(10)
			.build(&tauri::test::mock_app().handle()),
		Default::default(),
	)
	.await
}
