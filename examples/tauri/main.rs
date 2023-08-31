// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;

#[tauri::command]
fn test1() {
    std::thread::sleep(Duration::from_secs(5));
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![test1])
        .plugin(inspector_protocol::InspectorProtocolBuilder::new().build())
        .run(tauri::generate_context!("./tauri.conf.json"))
        .expect("error while running tauri application");
}
