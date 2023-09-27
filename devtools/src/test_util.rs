use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::sync::{Arc, Mutex};
use fake::{Fake, Faker};
use fake::faker::lorem::raw::Words;
use fake::locales::EN;
use jsonrpsee::server::ServerHandle;
use jsonrpsee::ws_client::WsClientBuilder;
use jsonrpsee_core::client::Client;
use tokio::sync::broadcast;
use tokio::task::JoinHandle;
use tracing_core::Level;
use tauri_devtools_shared::{LogEntry, Metadata, Metrics, SpanEntry};
use crate::server::Server;

pub async fn server_mock_with_channels(
    logs_channel: broadcast::Sender<Vec<LogEntry>>,
    spans_channel: broadcast::Sender<Vec<SpanEntry>>,
) -> crate::Result<(SocketAddr, ServerHandle)> {
    let metrics = Arc::new(Mutex::new(Metrics { initialized_at: tauri_devtools_shared::now(), ready_at: 0 }));

    Server::new(logs_channel,
                spans_channel,
                tauri::test::mock_app().handle(),
                metrics)
        .run(&SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 0))
        .await
}

pub async fn setup_ws_client_and_server(logs_channel: broadcast::Sender<Vec<LogEntry>>,
                                   spans_channel: broadcast::Sender<Vec<SpanEntry>>,) -> crate::Result<(Client, JoinHandle<()>)> {
    let (server_addr, handle) = server_mock_with_channels(logs_channel, spans_channel).await?;
    let server_url = format!("ws://{}", server_addr);
    let client = WsClientBuilder::default().build(&server_url).await?;
    let handle = tokio::spawn(handle.stopped());
    Ok((client, handle))
}

pub fn fake_log_entry() -> LogEntry {
    Faker.fake()

    // LogEntry {
    //     span: Faker.fake(),
    //     meta: Metadata {
    //         timestamp: Faker.fake(),
    //         level: &Level::DEBUG,
    //         target: &Faker.fake::<String>(),
    //         module_path: Some(&Faker.fake::<String>()),
    //         file: Some(&Faker.fake::<String>()),
    //         line: Faker.fake(),
    //         fields: vec![],
    //     },
    //     message: Faker.fake()
    // }
}