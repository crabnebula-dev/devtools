use crate::aggregator::Aggregator;
use crate::server::Server;
use crate::Command;
use std::net::SocketAddr;
use std::sync::Arc;
use std::thread;
use std::time::SystemTime;
use std::time::{Duration, Instant};
use tauri::{RunEvent, Runtime};
use tauri_devtools_wire_format::tauri::Metrics;
use tokio::sync::{mpsc, RwLock};

pub(crate) fn init<R: Runtime>(
    addr: SocketAddr,
    publish_interval: Duration,
    aggregator: Aggregator,
    cmd_tx: mpsc::Sender<Command>,
) -> tauri::plugin::TauriPlugin<R> {
    let now = Instant::now();
    let metrics = Arc::new(RwLock::new(Metrics {
        initialized_at: Some(aggregator.base_time.to_timestamp(now)), // TODO this is horrific
        ready_at: None,
    }));

    let m = metrics.clone();
    tauri::plugin::Builder::new("probe")
        .setup(move |app_handle| {
            let server = Server::new(cmd_tx, app_handle.clone(), publish_interval, m);

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
        .on_event(move |_, event| {
            if let RunEvent::Ready = event {
                let mut metrics = metrics.blocking_write();
                metrics.ready_at = Some(SystemTime::now().into());

                tracing::debug!("Application is ready");
            }
        })
        .build()
}
