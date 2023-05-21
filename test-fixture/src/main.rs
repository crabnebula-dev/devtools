// Copyright 2019-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::Duration;

fn main() {
    let context = tauri::generate_context!();

    subscriber::init(&context);

    tauri::Builder::default()
        .setup(|_| {
            tauri::async_runtime::spawn(async {
                loop {
                    tokio::time::sleep(Duration::from_millis(500)).await;
                    tracing::debug!("foobar");
                }
            });

            Ok(())
        })
        .run(context)
        .expect("error while running tauri application");
}
