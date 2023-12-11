use crate::aggregator::Aggregator;
use crate::server::Server;
use crate::Command;
use std::net::SocketAddr;
use std::thread;
use std::time::Duration;
use tauri::Runtime;
use tokio::sync::mpsc;

pub(crate) fn init<R: Runtime>(
    addr: SocketAddr,
    publish_interval: Duration,
    aggregator: Aggregator,
    cmd_tx: mpsc::Sender<Command>,
) -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("probe")
        .setup(move |app_handle| {
            let server = Server::new(cmd_tx, app_handle.clone());

            // spawn the server and aggregator in a separate thread
            // so we don't interfere with the application we're trying to instrument
            // TODO find a way to move this out of the tauri plugin
            thread::spawn(move || {
                use tracing_subscriber::EnvFilter;
                let s = tracing_subscriber::fmt()
                    .with_env_filter(EnvFilter::from_default_env())
                    .finish();
                let _subscriber_guard = tracing::subscriber::set_default(s);

                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .unwrap();

                rt.block_on(async move {
                    let aggregator = tokio::spawn(aggregator.run(publish_interval));
                    server.run(addr).await.unwrap();
                    aggregator.abort();
                });
            });

            Ok(())
        })
        .build()
}
