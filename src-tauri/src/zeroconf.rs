use mdns_sd::{ServiceDaemon, ServiceEvent};
use std::{collections::{HashMap, HashSet}, net::Ipv4Addr};
use tauri::{
    async_runtime::Mutex,
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime, State,
};

const SERVICE_TYPE: &str = "_cn-devtools._udp.local.";

struct NetworkSessions(Mutex<HashMap<String, SessionInfo>>);

#[derive(Debug, Clone, serde::Serialize)]
struct SessionInfo {
    grpc_port: u16,
    addresses: HashSet<Ipv4Addr>,
    hostname: String,
    os: String,
    arch: String,

    name: String,
    version: String,
    authors: String,
    description: String
}

/// Retrieve all network sessions we have discovered so far
#[tauri::command]
async fn network_sessions(
    network_sessions: State<'_, NetworkSessions>,
) -> Result<Vec<SessionInfo>, ()> {
    let network_sessions = network_sessions.0.lock().await;

    Ok(network_sessions.values().cloned().collect())
}

#[tauri::command]
async fn start_browse<R: Runtime>(
    app_handle: AppHandle<R>,
    daemon: State<'_, ServiceDaemon>,
) -> Result<(), ()> {
    // Browse for a service type.
    let receiver = daemon.browse(SERVICE_TYPE).expect("Failed to browse");

    while let Ok(event) = receiver.recv_async().await {
        match event {
            ServiceEvent::ServiceResolved(info) => {
                tracing::info!("service resolved {:?}", info);

                let network_sessions = app_handle.state::<NetworkSessions>();
                let mut network_sessions = network_sessions.0.lock().await;

                let (name, _) = info.get_fullname().split_once(".").unwrap();

                let session_info = SessionInfo {
                    grpc_port: info.get_port(),
                    addresses: info.get_addresses().clone(),
                    hostname: info.get_hostname().to_string(),
                    os: info.get_property_val_str("OS").unwrap().to_string(),
                    arch: info.get_property_val_str("ARCH").unwrap().to_string(),
                    name: name.to_string(),
                    version: info.get_property_val_str("VERSION").unwrap().to_string(),
                    authors: info.get_property_val_str("AUTHORS").unwrap().to_string(),
                    description: info.get_property_val_str("DESCRIPTION").unwrap().to_string(),
                };
                network_sessions.insert(info.get_fullname().to_string(), session_info.clone());

                drop(network_sessions);

                let _ = app_handle.emit_all("devtools://network-session-found", &session_info);

                tracing::info!("insert session {:?}", session_info);
            }
            ServiceEvent::ServiceRemoved(_, fullname) => {
                let network_sessions = app_handle.state::<NetworkSessions>();
                let mut network_sessions = network_sessions.0.lock().await;

                let _ = app_handle.emit_all("devtools://network-session-removed", &fullname);

                network_sessions.remove(&fullname);
            }
            ServiceEvent::ServiceFound(service_type, fullname) => {
                tracing::debug!("found service {} {}", service_type, fullname)
            }
            _other_event => {
                // tracin g::debug!("Received other event: {:?}", &other_event);
            }
        }
    }

    Ok(())
}

#[tauri::command]
fn stop_browse(daemon: State<'_, ServiceDaemon>) {
    daemon.stop_browse(SERVICE_TYPE).unwrap();
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("zeroconf")
        .invoke_handler(tauri::generate_handler![network_sessions, start_browse, stop_browse])
        .setup(|app| {
            app.manage(NetworkSessions(Default::default()));

            app.manage(ServiceDaemon::new().expect("Failed to create daemon"));

            Ok(())
        })
        .build()
}
