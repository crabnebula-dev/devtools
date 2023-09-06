#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
	tauri::Builder::default()
		.plugin(inspector_protocol::Builder::new().build())
		.run(tauri::generate_context!("./tauri.conf.json"))
		.expect("error while running tauri application");
}
