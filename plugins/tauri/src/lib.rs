//! # Tauri Plugin Devtools
//!
//! Integrated debugging solution for Tauri applications.
//!
//! Merging the capabilities of the [inspector_protocol_server] and the [inspector_protocol_subscriber], it offers
//! real-time tracing of Tauri events and spans via a WebSocket JSON-RPC server. Tailored for the [Tauri](tauri) ecosystem,
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
//! use tauri_plugin_devtools::devtools;
//!
//! fn main() {
//!   // It's important to initialize the devtools
//!   // subscriber soon as possible.
//!   let devtools = devtools().init();
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

pub use plugin::{Builder, Devtools};
mod plugin;

/// Returns a new [`Builder`] for configuring a [Devtools].
///
/// This is essentially shorthand for [`Builder::default()`].
///
/// # Examples
///
/// Using [`init`] to set the default subscriber:
///
/// ```rust
/// use tauri_plugin_devtools::devtools;
/// let devtools = devtools().init();
/// ```
///
/// [`try_init`] returns an error if the default subscriber could not be set:
///
/// ```rust
/// use std::error::Error;
/// use tauri_plugin_devtools::devtools;
///
/// fn init_subscriber() -> Result<(), Box<dyn Error + Send + Sync + 'static>> {
///   let devtools = devtools().try_init()?;
///   Ok(())
/// }
/// ```
///
/// Instead of making it the default, [`layer`] returns the built tracing subscriber.
/// You can then integrate it into other [`tracing`] functions:
///
/// ```rust
/// use tauri_plugin_devtools::devtools;
///
/// let devtools = devtools()
///   .with_max_level(tracing::Level::DEBUG)
///   .layer()
///   .finish();
///
/// tracing::subscriber::with_default(devtools, || {
///     // the subscriber will only be set as the default
///     // inside this closure...
/// })
/// ```
///
/// You can also enhance the Devtool subscriber with
/// multiple [`tracing_subscriber::Layer`]:
///
/// ```rust
/// use tauri_plugin_devtools::devtools;
/// use tracing_subscriber::prelude::*;
///
/// let devtools = devtools()
///   .with_max_level(tracing::Level::DEBUG)
///   .layer()
///   .finish();
///
/// devtools
///   .with(tracing_subscriber::fmt::layer())
///   .init();
/// ```
///
/// # Tauri Plugin Initialization
///
/// To set up the Tauri plugin, pass the [`Devtools`]
/// instance to the [`tauri::Builder`]:
///
/// ```ignore
/// use tauri_plugin_devtools::devtools;
/// let devtools = devtools().init();
/// tauri::Builder::default()
///   .plugin(devtools)
///   .run(tauri::generate_context!("./tauri.conf.json"))
///   .expect("error while running tauri application");
/// ```
///
/// [`init`]: Builder::init()
/// [`try_init`]: Builder::try_init()
/// [`finish`]: Builder::finish()
/// [`layer`]: Builder::layer()
pub fn devtools() -> Builder {
	Builder::new()
}
