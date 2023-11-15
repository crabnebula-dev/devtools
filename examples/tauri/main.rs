#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(clippy::items_after_statements)]

use std::time::Duration;

#[tauri::command]
async fn test1(url: String, timeout_seconds: u64) -> String {
    tracing::trace!("test trace event");
    tracing::debug!("test debug event");
    tracing::info!("test info event");
    tracing::warn!("test warn event");
    tracing::error!("test error event");

    tokio::time::sleep(Duration::from_secs(timeout_seconds)).await;

    reqwest::get(url)
        .await
        .expect("valid response")
        .text()
        .await
        .expect("valid text")
}

fn main() {
    let devtools = tauri_devtools::init();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![test1])
        .plugin(devtools)
        .run(tauri::generate_context!("./tauri.conf.json"))
        .expect("error while running tauri application");
}
