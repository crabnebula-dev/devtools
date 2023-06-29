#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod instrument;
mod zeroconf;

// use log::LevelFilter;
// use tauri_plugin_log::{LogTarget, fern::colors::ColoredLevelConfig, Builder as LoggerBuilder};
// use env_logger::filter::Builder as FilterBuilder;

fn main() {
    // let log_plugin = {
    //     let targets = [
    //         LogTarget::LogDir,
    //         #[cfg(debug_assertions)]
    //         LogTarget::Stdout,
    //         #[cfg(debug_assertions)]
    //         LogTarget::Webview,
    //     ];

    //     // take the log filter configuration from the RUST_LOG environment variable.
    //     let filter = std::env::var("RUST_LOG")
    //         .map(|ref filter| FilterBuilder::new().parse(filter).build().filter())
    //         .unwrap_or(LevelFilter::Debug);

    //     let builder = LoggerBuilder::new().targets(targets).level(filter);

    //     #[cfg(debug_assertions)]
    //     let builder = builder.with_colors(ColoredLevelConfig::default());

    //     builder.build()
    // };

    tauri::Builder::default()
        // .plugin(log_plugin)
        .plugin(zeroconf::init())
        .plugin(instrument::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
