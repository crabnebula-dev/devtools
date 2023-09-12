#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;

#[tauri::command]
async fn test1() -> String {
	tracing::info!("command test1");

	tokio::time::sleep(Duration::from_secs(5)).await;

	reqwest::get("https://www.rust-lang.org")
		.await
		.expect("valid json")
		.text()
		.await
		.expect("valid text")
}

fn main() {
	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![test1])
		.plugin(inspector_protocol::Builder::new().build())
		.run(tauri::generate_context!("./tauri.conf.json"))
		.expect("error while running tauri application");
}
