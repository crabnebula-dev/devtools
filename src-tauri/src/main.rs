#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use mdns_sd::{ServiceDaemon, ServiceEvent};
use log::LevelFilter;
use std::collections::HashMap;
use tauri::{async_runtime::Mutex, Manager, State};
use tauri_plugin_log::{LogTarget, fern::colors::ColoredLevelConfig, Builder as LoggerBuilder};
use env_logger::filter::Builder as FilterBuilder;

struct NetworkSessions(Mutex<HashMap<String, SessionInfo>>);

#[derive(Debug, Clone, serde::Serialize)]
struct SessionInfo {
    grpc_port: u16,
    hostname: String,
    os: String,
    arch: String,
}

#[tauri::command]
async fn network_sessions(
    network_sessions: State<'_, NetworkSessions>,
) -> Result<Vec<SessionInfo>, ()> {
    let network_sessions = network_sessions.0.lock().await;

    Ok(network_sessions.values().cloned().collect())
}

fn main() {
    // Create a daemon
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");

    // Browse for a service type.
    let service_type = "_cn-devtools._udp.local.";
    let receiver = mdns.browse(service_type).expect("Failed to browse");

    let log_plugin = {
        let targets = [
            LogTarget::LogDir,
            #[cfg(debug_assertions)]
            LogTarget::Stdout,
            #[cfg(debug_assertions)]
            LogTarget::Webview,
        ];

        // take the log filter configuration from the RUST_LOG environment variable.
        let filter = std::env::var("RUST_LOG")
            .map(|ref filter| FilterBuilder::new().parse(filter).build().filter())
            .unwrap_or(LevelFilter::Debug);

        let builder = LoggerBuilder::new()
            .targets(targets)
            .level(filter);

        #[cfg(debug_assertions)]
        let builder = builder.with_colors(ColoredLevelConfig::default());

        builder.build()
    };

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![network_sessions])
        .plugin(log_plugin)
        .setup(|app| {
            app.manage(NetworkSessions(Default::default()));

            let app_handle = app.handle();

            tauri::async_runtime::spawn(async move {
                while let Ok(event) = receiver.recv_async().await {
                    match event {
                        ServiceEvent::ServiceResolved(info) => {
                            tracing::debug!("service resolved {:?}", info);

                            let network_sessions = app_handle.state::<NetworkSessions>();
                            let mut network_sessions = network_sessions.0.lock().await;

                            let session_info = SessionInfo {
                                grpc_port: info.get_port(),
                                hostname: info.get_hostname().to_string(),
                                os: info.get_property_val_str("OS").unwrap().to_string(),
                                arch: info.get_property_val_str("ARCH").unwrap().to_string(),
                            };
                            network_sessions
                                .insert(info.get_fullname().to_string(), session_info.clone());

                            drop(network_sessions);

                            app_handle.emit_all("devtools://network-session-found", &session_info);

                            tracing::debug!("insert session {:?}", session_info);
                        }
                        ServiceEvent::ServiceRemoved(_, fullname) => {
                            let network_sessions = app_handle.state::<NetworkSessions>();
                            let mut network_sessions = network_sessions.0.lock().await;

                            app_handle.emit_all("devtools://network-session-removed", &fullname);

                            network_sessions.remove(&fullname);
                        }
                        ServiceEvent::ServiceFound(service_type, fullname) => {
                            tracing::debug!("found service {} {}", service_type, fullname)
                        }
                        other_event => {
                            tracing::debug!("Received other event: {:?}", &other_event);
                        }
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
