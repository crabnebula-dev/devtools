use crate::aggregator::Aggregator;
use crate::server::Server;
use crate::Command;
use std::collections::HashMap;
use std::net::SocketAddr;
use std::thread;
use std::time::Duration;
use tauri::Runtime;
use tokio::sync::mpsc;

#[derive(Clone, PartialEq, Eq, PartialOrd, Ord)]
struct Key {
    level: u16,
    file: Option<String>,
    line: Option<u32>,
}

#[tauri::command]
fn log(
    level: u16,
    message: String,
    location: Option<&str>,
    file: Option<&str>,
    line: Option<u32>,
    _key_values: Option<HashMap<String, String>>,
) -> Result<(), ()> {
    match level {
        1 => {
            tracing::trace!(target: "log", message, log.target = "webview", log.module_path = location, log.file = file, log.line = line);
        }
        2 => {
            tracing::debug!(target: "log", message, log.target = "webview", log.module_path = location, log.file = file, log.line = line)
        }
        3 => {
            tracing::info!(target: "log", message, log.target = "webview", log.module_path = location, log.file = file, log.line = line);
        }
        4 => {
            tracing::warn!(target: "log", message, log.target = "webview", log.module_path = location, log.file = file, log.line = line);
        }
        5 => {
            tracing::error!(target: "log", message, log.target = "webview", log.module_path = location, log.file = file, log.line = line);
        }
        _ => {}
    }

    Ok(())
}

pub(crate) fn init<R: Runtime>(
    addr: SocketAddr,
    publish_interval: Duration,
    aggregator: Aggregator,
    cmd_tx: mpsc::Sender<Command>,
) -> tauri::plugin::TauriPlugin<R> {
    // we pretend to be the log plugin so we can intercept the commands
    // this plugin is incompatible with the log plugin anyway
    tauri::plugin::Builder::new("log")
        .invoke_handler(tauri::generate_handler![log])
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
