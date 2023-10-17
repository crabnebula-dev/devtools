mod aggregator;
mod error;
mod layer;
mod server;
mod tauri_plugin;
mod visitors;

use crate::aggregator::Aggregator;
use crate::layer::Layer;
use api::{instrument, Field};
pub use error::Error;
use server::DEFAULT_ADDRESS;
use std::sync::atomic::AtomicUsize;
use std::sync::Arc;
use std::time::Instant;
use tauri::Runtime;
use tokio::sync::mpsc;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::Layer as _;
pub(crate) type Result<T> = std::result::Result<T, Error>;

/// URL of the web-based devtool
/// The server host is added automatically eg: `127.0.0.1:56609`.
const DEVTOOL_URL: &str = "https://crabnebula.dev/debug/#";

pub fn init<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    try_init().unwrap()
}

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

    println!("--------- Tauri Plugin Devtools ---------\n");
    println!("Listening at:\n  http://{DEFAULT_ADDRESS}\n",);
    println!("Inspect in browser:\n  {DEVTOOL_URL}{DEFAULT_ADDRESS}");
    println!("\n--------- Tauri Plugin Devtools ---------");

    let plugin = tauri_plugin::init(aggregator, cmd_tx);
    Ok(plugin)
}

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
    interests: instrument::Interests,
}
