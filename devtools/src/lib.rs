//! # Tauri Plugin Devtools
//!
//! Integrated debugging solution for Tauri applications.
//!
//! It offers real-time tracing of Tauri events and spans via a WebSocket JSON-RPC server. Tailored for the [Tauri](tauri) ecosystem,
//! this plugin streamlines performance analysis and offers unparalleled insights into your application's behavior.
//!
//! Here's a quick rundown of what it offers:
//!
//! - A built-in [tracing](tracing) subscriber, ensuring support for multiple crates
//!   right out of the gate.
//!
//! - An integrated [JSON RPC server](inspector_protocol_server) using WebSocket transport.
//!
//! - Direct access to [Tauri](tauri)'s runtime, windows, and configuration. This means developers can peek
//!   and poke into the very heart of Tauri application's runtime tracing.
//!
//! ## Getting Started
//!
//! A brief example to get you started with Devtools in a [Tauri](https://tauri.app) application:
//!
//! ```ignore
//! fn main() {
//!   // It's important to initialize the devtools
//!   // subscriber soon as possible.
//!   let devtools = tauri_devtools::init();
//!
//!   tauri::Builder::default()
//!     .invoke_handler(tauri::generate_handler![test1])
//!     // It's important to link the `Devtools` with our app
//!     // to initialize the tauri plugin.
//!     .plugin(devtools)
//!     .run(tauri::generate_context!("./tauri.conf.json"))
//!     .expect("error while running tauri application");
//! }
//! ```
//!
//! Then, run your application with `--inspect` flag to initialize the Devtools plugin.

mod broadcaster;
mod error;
mod layer;
mod server;
mod tauri_plugin;
mod visitors;
#[cfg(test)]
mod test_util;

use crate::broadcaster::Broadcaster;
use crate::layer::Layer;
use crate::tauri_plugin::TauriPlugin;
pub use error::Error;
use tokio::sync::{broadcast, mpsc, watch};
use tracing_subscriber::prelude::*;
use tracing_subscriber::util::SubscriberInitExt;

pub(crate) type Result<T> = std::result::Result<T, Error>;

/// CLI flag that determines whether the inspector protocol
/// should be active or not.
const INSPECT_FLAG: &str = "--inspect";
/// Default [broadcast] channels capacity.
const DEFAULT_CAPACITY: usize = 10_000;

pub fn init() -> TauriPlugin {
	try_init().unwrap()
}

pub fn try_init() -> Result<TauriPlugin> {
	let enabled = std::env::args()
		.collect::<Vec<String>>()
		.contains(&INSPECT_FLAG.to_string());

	// set up data channels
	let (trees_tx, trees_rx) = mpsc::unbounded_channel();
	let (logs_tx, _) = broadcast::channel(DEFAULT_CAPACITY);
	let (spans_tx, _) = broadcast::channel(DEFAULT_CAPACITY);
	let (shutdown_tx, shutdown_rx) = watch::channel(());

	// set up components
	let layer = Layer::new(trees_tx);
	let broadcaster = Broadcaster::new(trees_rx, shutdown_rx, logs_tx.clone(), spans_tx.clone());
	let plugin = TauriPlugin::new(enabled, broadcaster, logs_tx, spans_tx, shutdown_tx);

	// initialize early so we don't miss any spans
	tracing_subscriber::registry()
		.with(layer.with_filter(tracing_subscriber::filter::LevelFilter::DEBUG))
		.try_init()?;

	Ok(plugin)
}
