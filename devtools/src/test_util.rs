use crate::server::Server;
use fake::faker::lorem::raw::Words;
use fake::locales::EN;
use fake::{Fake, Faker};
use jsonrpsee::server::ServerHandle;
use jsonrpsee::ws_client::WsClientBuilder;
use jsonrpsee_core::client::Client;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::sync::{Arc, Mutex};
use tauri_devtools_shared::{LogEntry, Metadata, Metrics, SpanEntry};
use tokio::sync::broadcast;
use tokio::task::JoinHandle;
use tracing_core::Level;

pub async fn server_mock_with_channels(
	logs_channel: broadcast::Sender<Vec<LogEntry>>,
	spans_channel: broadcast::Sender<Vec<SpanEntry>>,
) -> crate::Result<(SocketAddr, ServerHandle)> {
	let metrics = Arc::new(Mutex::new(Metrics {
		initialized_at: tauri_devtools_shared::now(),
		ready_at: 0,
	}));

	Server::new(logs_channel, spans_channel, tauri::test::mock_app().handle(), metrics)
		.run(&SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 0))
		.await
}

pub async fn setup_ws_client_and_server(
	logs_channel: broadcast::Sender<Vec<LogEntry>>,
	spans_channel: broadcast::Sender<Vec<SpanEntry>>,
) -> crate::Result<(Client, JoinHandle<()>)> {
	let (server_addr, handle) = server_mock_with_channels(logs_channel, spans_channel).await?;
	let server_url = format!("ws://{}", server_addr);
	let client = WsClientBuilder::default().build(&server_url).await?;
	let handle = tokio::spawn(handle.stopped());
	Ok((client, handle))
}
