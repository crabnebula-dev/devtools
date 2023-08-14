// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;

#[tauri::command]
fn test(foo: &str) -> &str {
    tracing::debug!("command test");

    foo
}

#[tauri::command]
async fn test2() {
    tracing::debug!("command test2");
}

#[tauri::command(async)]
fn test3() {
    tracing::debug!("command test3");
}

#[tauri::command]
fn test4() -> Result<(), String> {
    tracing::debug!("command test4");

    Ok(())
}

#[tauri::command]
async fn test5() {
    tracing::debug!("command test5");

    tokio::time::sleep(Duration::from_secs(5)).await;
}

#[tauri::command]
fn test6() {
    tracing::debug!("command test6");

    unsafe {
        sadness_generator::raise_segfault();
    }
}

fn main() {
    let context = tauri::generate_context!();

    subscriber::init(&context);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            test, test2, test3, test4, test5, test6
        ])
        .run(context)
        .expect("error while running tauri application");
}
