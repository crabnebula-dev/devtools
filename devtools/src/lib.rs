#![allow(clippy::doc_markdown)]

//! Instrumentation code that will make your Tauri app compatible with CrabNebula Devtools.
//!
//! CrabNebula Devtools offers seamless and intuitive debugging, and monitoring of Tauri applications.
//!
//! The instrumentation is compatible with both the [`log`](https://docs.rs/log/latest/log/)
//! and [`tracing`](https://docs.rs/tracing/latest/tracing/) ecosystems out-of-the-box.
//!
//! # Example
//!
//! Make sure to check out the `examples` sub folder for a fully working setup.
//!
//! ```no_run
//! fn main() {
//!     let devtools_plugin = devtools::init();
//!
//!     tauri::Builder::default()
//!         .plugin(devtools_plugin)
//!         .setup(|_| {
//!             // It is compatible with the `tracing` ecosystem!
//!             tracing::info!("Hello World!");
//!
//!             Ok(())
//!         })
//!          // ... the rest of the tauri setup code
//! #       .run(tauri::test::mock_context(tauri::test::noop_assets()))
//! #       .expect("error while running tauri application");
//! }
//! ```

mod aggregator;
mod builder;
mod error;
mod layer;
mod server;
mod tauri_plugin;
mod visitors;

pub use builder::Builder;
use devtools_wire_format::{instrument, Field};
pub use error::Error;
use std::sync::atomic::AtomicUsize;
use std::time::Instant;
use tauri::Runtime;
use tokio::sync::{mpsc, Notify};

const EVENT_BUFFER_CAPACITY: usize = 512;

pub(crate) type Result<T> = std::result::Result<T, Error>;

/// Initializes the global tracing subscriber.
///
/// See [`Builder::init`] for details and documentation.
///
/// # Panics
///
/// This function will panic if it is called more than once, or if another library has already initialized a global tracing subscriber.
#[must_use = "This function returns a TauriPlugin that needs to be added to the Tauri app in order to properly instrument it."]
pub fn init<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    Builder::default().init()
}

/// Initializes the global tracing subscriber.
///
/// See [`Builder::try_init`] for details and documentation.
///
/// # Errors
///
/// This function will fail if it is called more than once, or if another library has already initialized a global tracing subscriber.
#[must_use = "This function returns a TauriPlugin that needs to be added to the Tauri app in order to properly instrument it."]
pub fn try_init<R: Runtime>() -> Result<tauri::plugin::TauriPlugin<R>> {
    Builder::default().try_init()
}

/// Shared data between the [`Layer`] and the [`Aggregator`]
#[derive(Debug, Default)]
pub(crate) struct Shared {
    dropped_log_events: AtomicUsize,
    dropped_span_events: AtomicUsize,
    flush: Notify,
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
