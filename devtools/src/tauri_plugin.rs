use crate::aggregator::Aggregator;
use crate::server::{Server, DEFAULT_ADDRESS};
use crate::Command;
use std::sync::Arc;
use std::thread;
use std::time::SystemTime;
use tauri::{RunEvent, Runtime};
use tauri_devtools_wire_format::tauri::Metrics;
use tokio::sync::{mpsc, RwLock};

pub(crate) fn init<R: Runtime>(
    aggregator: Aggregator,
    cmd_tx: mpsc::Sender<Command>,
) -> tauri::plugin::TauriPlugin<R> {
    let metrics = Arc::new(RwLock::new(Metrics::default()));

    let m = metrics.clone();
    tauri::plugin::Builder::new("probe")
        .setup(move |app_handle| {
            let server = Server::new(cmd_tx, app_handle.clone(), m);

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
                    let aggregator = tokio::spawn(aggregator.run());
                    server.run(DEFAULT_ADDRESS).await.unwrap();
                    aggregator.abort();
                })
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
