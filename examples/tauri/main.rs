#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;

#[tauri::command]
async fn test1() -> String {
    tracing::trace!("test trace event");
    tracing::debug!("test debug event");
    tracing::info!("test info event");
    tracing::warn!("test warn event");
    tracing::error!("test error event");

    tokio::time::sleep(Duration::from_secs(5)).await;

    reqwest::get("https://www.rust-lang.org")
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
