//! Instrumentation code that will make your Tauri app compatible with CrabNebula Devtools.
//!
//! CrabNebula Devtools offers seamless and intuitive debugging, and monitoring of Tauri applications.
//!
//! The instrumentation is compatible with both the [`log`](https://docs.rs/log/latest/log/)
//! and [`tracing`](https://docs.rs/tracing/latest/tracing/) ecosystems out-of-the-box.
//!
//! # Example
//!
//! ```rust,no_run
//! fn main() {
//!     let devtools = tauri_devtools::init();
//!
//!     tauri::Builder::default()
//!         .plugin(devtools)
//!         .setup(|| {
//!             // It is compatible with the `tracing` ecosystem!
//!             tracing::info!("Hello World!");
//!
//!             Ok(())
//!         })
//!         .run(tauri::generate_context!())
//!         .expect("error while running tauri application");
//! }
//! ```

mod aggregator;
mod error;
mod layer;
mod server;
mod tauri_plugin;
mod visitors;

use crate::aggregator::Aggregator;
use crate::layer::Layer;
use colored::Colorize;
pub use error::Error;
use server::DEFAULT_ADDRESS;
use std::sync::atomic::AtomicUsize;
use std::sync::Arc;
use std::time::Instant;
use tauri::Runtime;
use tauri_devtools_wire_format::{instrument, Field};
use tokio::sync::mpsc;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::Layer as _;

pub(crate) type Result<T> = std::result::Result<T, Error>;

/// URL of the web-based devtool
/// The server host is added automatically eg: `127.0.0.1:56609`.
const DEVTOOL_URL: &str = "http://localhost:5173/dash/";
// const DEVTOOL_URL: &str = "https://crabnebula.dev/debug/#";

/// Initializes the global tracing subscriber.
///
/// This should be called as early in the execution of the app as possible.
/// Any events that occur before initialization will be ignored.
///
/// This function returns a [`tauri::plugin::TauriPlugin`] that needs to be added to the
/// Tauri app in order to properly instrument it.
///
/// # Example
///
/// ```rust,no_run
/// fn main() {
///     let devtools = tauri_devtools::init();
///
///     tauri::Builder::default()
///         .plugin(devtools)
///         .run(tauri::generate_context!())
///         .expect("error while running tauri application");
/// }
/// ```
///
/// # Panics
///
/// This function will panic if it is called more than once, or if another library has already initialized a global tracing subscriber.
#[must_use = "This function returns a TauriPlugin that needs to be added to the Tauri app in order to properly instrument it."]
pub fn init<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    try_init().unwrap()
}

/// Initializes the global tracing subscriber.
///
/// This should be called as early in the execution of the app as possible.
/// Any events that occur before initialization will be ignored.
///
/// This function returns a [`tauri::plugin::TauriPlugin`] that needs to be added to the
/// Tauri app in order to properly instrument it.
///
/// # Example
///
/// ```rust,no_run
/// fn main() {
///     let devtools = tauri_devtools::init();
///
///     tauri::Builder::default()
///         .plugin(devtools)
///         .run(tauri::generate_context!())
///         .expect("error while running tauri application");
/// }
/// ```
///
/// # Errors
///
/// This function will fail if it is called more than once, or if another library has already initialized a global tracing subscriber.
#[must_use = "This function returns a TauriPlugin that needs to be added to the Tauri app in order to properly instrument it."]
pub fn try_init<R: Runtime>() -> Result<tauri::plugin::TauriPlugin<R>> {
    // set up data channels & shared data
    let shared = Arc::new(Shared::default());
    let (event_tx, event_rx) = mpsc::channel(256);
    let (cmd_tx, cmd_rx) = mpsc::channel(256);

    // set up components
    let layer = Layer::new(shared.clone(), event_tx);
    let aggregator = Aggregator::new(shared, event_rx, cmd_rx);

    // initialize early so we don't miss any spans
    tracing_subscriber::registry()
        .with(layer.with_filter(tracing_subscriber::filter::LevelFilter::TRACE))
        .try_init()?;

    // This is pretty ugly code I know, but it looks nice in the terminal soo ¯\_(ツ)_/¯
    let url = format!(
        "{DEVTOOL_URL}{}/{}",
        DEFAULT_ADDRESS.ip(),
        DEFAULT_ADDRESS.port()
    );
    println!(
        r#"
   {} {}{}
   {}   Local:   {}
"#,
        "Tauri Devtools".bright_purple(),
        "v".purple(),
        env!("CARGO_PKG_VERSION").purple(),
        "→".bright_purple(),
        url.underline().blue()
    );

    let plugin = tauri_plugin::init(aggregator, cmd_tx);
    Ok(plugin)
}

/// Shared data between the [`Layer`] and the [`Aggregator`]
#[derive(Debug, Default)]
pub(crate) struct Shared {
    dropped_log_events: AtomicUsize,
    dropped_span_events: AtomicUsize,
}

/// Data sent from the `Layer` to the `Aggregator`
///
/// This is designed to be as cheap to create as possible so the `Layer` impl remains lightweight.
#[derive(Debug)]
pub(crate) enum Event {
    /// The tracing system registered new span or event metadata
    /// Metadata is the portion of a data point that remains static.
    Metadata(&'static tracing_core::Metadata<'static>),
    /// A new event was emitted.
    /// This usually corresponds to a log event.
    Event {
        at: Instant,
        metadata: &'static tracing_core::Metadata<'static>,
        message: String,
        fields: Vec<Field>,
        maybe_parent: Option<tracing_core::span::Id>,
    },
    /// A new span was created.
    NewSpan {
        at: Instant,
        id: tracing_core::span::Id,
        metadata: &'static tracing_core::Metadata<'static>,
        fields: Vec<Field>,
        maybe_parent: Option<tracing_core::span::Id>,
    },
    /// A previously created span was entered.
    EnterSpan {
        at: Instant,
        thread_id: u64,
        span_id: tracing_core::span::Id,
    },
    /// A previously created and entered span was exited.
    ExitSpan {
        at: Instant,
        thread_id: u64,
        span_id: tracing_core::span::Id,
    },
    /// A previously created span has been closed.
    /// No new events regarding this particular span will be emitted.
    /// NOTE: The span ID that corresponded to this span might be reused!
    CloseSpan {
        at: Instant,
        span_id: tracing_core::span::Id,
    },
}

/// Commands send from the `Server` to the `Aggregator`
pub(crate) enum Command {
    Instrument(Watcher),
}

struct Watcher {
    tx: mpsc::Sender<Result<instrument::Update>>,
}
