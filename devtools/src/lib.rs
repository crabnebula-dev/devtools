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

use crate::broadcaster::Broadcaster;
use crate::layer::Layer;
use crate::tauri_plugin::TauriPlugin;
pub use error::Error;
use std::time::Instant;
use tauri_devtools_wire_format as wire;
use tokio::sync::mpsc;
use tracing_subscriber::prelude::*;
use tracing_subscriber::util::SubscriberInitExt;

pub(crate) type Result<T> = std::result::Result<T, Error>;

/// CLI flag that determines whether the inspector protocol
/// should be active or not.
const INSPECT_FLAG: &str = "--inspect";

pub fn init() -> TauriPlugin {
	try_init().unwrap()
}

pub fn try_init() -> Result<TauriPlugin> {
	let enabled = std::env::args()
		.collect::<Vec<String>>()
		.contains(&INSPECT_FLAG.to_string());

	// set up data channels
	let (event_tx, event_rx) = mpsc::channel(256);
	let (cmd_tx, cmd_rx) = mpsc::channel(256);

	// set up components
	let layer = Layer::new(event_tx);
	let broadcaster = Broadcaster::new(event_rx, cmd_rx);
	let plugin = TauriPlugin::new(enabled, broadcaster, cmd_tx);

	// initialize early so we don't miss any spans
	tracing_subscriber::registry()
		.with(layer.with_filter(tracing_subscriber::filter::LevelFilter::TRACE))
		.try_init()?;

	Ok(plugin)
}

/// Data sent from the `Layer` to the `Broadcaster`
#[derive(Debug)]
enum Event {
	Metadata(&'static tracing_core::Metadata<'static>),
	LogEvent(LogEvent),
	NewSpan(NewSpan),
	EnterSpan(EnterSpan),
	ExitSpan(ExitSpan),
	CloseSpan(CloseSpan),
}

#[derive(Debug)]
struct LogEvent {
	at: Instant,
	metadata: &'static tracing_core::Metadata<'static>,
	message: String,
	fields: Vec<wire::Field>,
	maybe_parent: Option<tracing_core::span::Id>,
}

#[derive(Debug)]
struct NewSpan {
	at: Instant,
	id: tracing_core::span::Id,
	metadata: &'static tracing_core::Metadata<'static>,
	fields: Vec<wire::Field>,
	maybe_parent: Option<tracing_core::span::Id>,
}

#[derive(Debug)]
struct EnterSpan {
	at: Instant,
	thread_id: u64,
	span_id: tracing_core::span::Id,
}

#[derive(Debug)]
struct ExitSpan {
	at: Instant,
	thread_id: u64,
	span_id: tracing_core::span::Id,
}

#[derive(Debug)]
struct CloseSpan {
	at: Instant,
	span_id: tracing_core::span::Id,
}

/// Commands send from the `Server` to the `Broadcaster`
#[derive(Debug)]
enum Command {
	Instrument(Watcher),
}

#[derive(Debug)]
struct Watcher {
	// TODO use these fields
	log_filter: Option<wire::instrument::Filter>,
	span_filter: Option<wire::instrument::Filter>,

	tx: mpsc::Sender<Result<wire::instrument::Update>>,
}
