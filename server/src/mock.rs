use crate::{config::Config, context::ContextBuilder, error::Result, server::start_server};
use inspector_protocol_primitives::{EntryT, Filter, FilterT};
use jsonrpsee::{server::ServerHandle, ws_client::WsClientBuilder};
use jsonrpsee_core::client::Client;
use serde::{Deserialize, Serialize};
use std::{iter, net::SocketAddr};
use tauri::test::MockRuntime;
use tokio::{sync::broadcast, task::JoinHandle};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockEntry {
	pub(crate) text: String,
}
impl EntryT for MockEntry {}

impl FilterT for MockEntry {
	fn match_filter(&self, _filter: &Filter) -> bool {
		true
	}
}

pub struct MockConfig;
impl Config for MockConfig {
	type Log = MockEntry;
	type Span = MockEntry;
	type Runtime = MockRuntime;
}

pub async fn server_mock() -> Result<(SocketAddr, ServerHandle)> {
	start_server(
		ContextBuilder::<MockConfig>::new()
			.with_capacity(10)
			.build(&tauri::test::mock_app().handle()),
		Default::default(),
	)
	.await
}

pub async fn server_mock_with_channels(
	logs_channel: broadcast::Sender<Vec<MockEntry>>,
	spans_channel: broadcast::Sender<Vec<MockEntry>>,
) -> Result<(SocketAddr, ServerHandle)> {
	start_server(
		ContextBuilder::<MockConfig>::new()
			.with_logs_channel(logs_channel)
			.with_spans_channel(spans_channel)
			.build(&tauri::test::mock_app().handle()),
		Default::default(),
	)
	.await
}

// use same channel for spans & logs
pub async fn ws_client_with_server_with_channel(
	channel: &broadcast::Sender<Vec<MockEntry>>,
) -> Result<(Client, JoinHandle<()>)> {
	let (server_addr, handle) = server_mock_with_channels(channel.clone(), channel.clone()).await?;
	let server_url = format!("ws://{}", server_addr);
	let client = WsClientBuilder::default().build(&server_url).await?;
	let handle = tokio::spawn(handle.stopped());
	Ok((client, handle))
}

pub async fn ws_client_with_server() -> Result<(Client, JoinHandle<()>)> {
	let (server_addr, handle) = server_mock().await?;
	let server_url = format!("ws://{}", server_addr);
	let client = WsClientBuilder::default().build(&server_url).await?;
	let handle = tokio::spawn(handle.stopped());
	Ok((client, handle))
}

pub fn mutiple_entries(count: usize) -> Vec<MockEntry> {
	let text = "hello".to_string();
	iter::repeat(MockEntry { text }).take(count).collect()
}
