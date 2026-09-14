#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(clippy::items_after_statements)]

use std::time::Duration;

use tauri::{Emitter, EventTarget};

#[cfg(not(any(feature = "wry", feature = "cef")))]
compile_error!("enable the `wry` (default) or `cef` feature to select a webview runtime");

#[derive(serde::Serialize)]
struct EventPayload {
    key: &'static str,
    value: String,
}

#[tauri::command]
async fn test1(
    app: tauri::AppHandle,
    window: tauri::Window,
    url: String,
    timeout_seconds: u64,
) -> String {
    tracing::trace!("test trace event");
    tracing::debug!("test debug event");
    tracing::info!("test info event");
    tracing::warn!("test warn event");
    tracing::error!("test error event");

    app.emit("test1-event", "sleeping").unwrap();

    tokio::time::sleep(Duration::from_secs(timeout_seconds)).await;

    app.emit_filter("ping-filter-main", "making get request", |w| {
        matches!(
            w,
            EventTarget::Webview { label } |
            EventTarget::Window { label } |
            EventTarget::WebviewWindow { label } if label == "main")
    })
    .unwrap();

    window
        .emit(
            "from-window",
            &EventPayload {
                key: "url",
                value: url.clone(),
            },
        )
        .unwrap();

    window
        .emit_to("other-window", "to-other-window", ())
        .unwrap();

    reqwest::get(url)
        .await
        .expect("valid response")
        .text()
        .await
        .expect("valid text")
}

/// The webview runtime this build was compiled with and its engine version.
#[tauri::command]
#[allow(clippy::needless_pass_by_value)] // commands take `AppHandle` by value
fn runtime_info(app: tauri::AppHandle) -> String {
    let runtime = if cfg!(feature = "cef") { "CEF" } else { "wry" };
    let version = app
        .webview_version()
        .unwrap_or_else(|_| "unknown".to_string());
    format!("{runtime} ({version})")
}

/// Run the application.
///
/// # Panics
///
/// Panics if the application cannot be built.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
// CEF runs its renderer, GPU and utility processes from this same executable;
// the attribute handles those and returns before the app is ever built.
#[cfg_attr(feature = "cef", tauri_runtime_cef::cef_entry_point)]
pub fn run() {
    let devtools = tauri_plugin_devtools::init();

    // Tauri v3 does not bundle a webview runtime, the app selects one explicitly.
    // CEF takes precedence when both features are enabled, like the Tauri CLI does.
    #[cfg(feature = "cef")]
    let builder = tauri::Builder::default().runtime(tauri_runtime_cef::Cef::default());
    #[cfg(not(feature = "cef"))]
    let builder = tauri::Builder::default().runtime(tauri_runtime_wry::Wry::default());

    builder
        .invoke_handler(tauri::generate_handler![test1, runtime_info])
        .plugin(devtools)
        .run(tauri::generate_context!("./tauri.conf.json"))
        .expect("error while running tauri application");
}
