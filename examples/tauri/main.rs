#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;
use tauri_plugin_devtools::devtools;

#[tauri::command]
async fn test1(arg: String) -> String {
	tracing::info!("command test1: {arg}");
	tokio::time::sleep(Duration::from_secs(5)).await;

	reqwest::get("https://www.rust-lang.org")
		.await
		.expect("valid response")
		.text()
		.await
		.expect("valid text")
}

fn main() {
	let devtools = devtools().with_port(3000).init();

	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![test1])
		.plugin(devtools)
		.plugin(tauri_plugin_window::init())
		.run(tauri::generate_context!("./tauri.conf.json"))
		.expect("error while running tauri application");
}
