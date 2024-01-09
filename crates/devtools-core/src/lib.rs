#![allow(clippy::doc_markdown, clippy::needless_doctest_main)]

//! Instrumentation code that will make your Tauri app compatible with CrabNebula Devtools.
//!
//! CrabNebula Devtools offers seamless and intuitive debugging, and monitoring of Tauri applications.
//!
//! The instrumentation is compatible with both the [`log`](https://docs.rs/log/latest/log/)
//! and [`tracing`](https://docs.rs/tracing/latest/tracing/) ecosystems out-of-the-box.

pub mod aggregator;
mod error;
pub mod layer;
pub mod server;
mod visitors;

use devtools_wire_format::{instrument, Field};
pub use error::Error;
use std::sync::atomic::AtomicUsize;
use std::time::Instant;
use tokio::sync::{mpsc, Notify};

const EVENT_BUFFER_CAPACITY: usize = 512;

pub type Result<T> = std::result::Result<T, Error>;

/// Shared data between the [`Layer`] and the [`Aggregator`]
#[derive(Debug, Default)]
pub struct Shared {
    dropped_log_events: AtomicUsize,
    dropped_span_events: AtomicUsize,
    flush: Notify,
}

/// Data sent from the `Layer` to the `Aggregator`
///
/// This is designed to be as cheap to create as possible so the `Layer` impl remains lightweight.
#[derive(Debug)]
pub enum Event {
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
    /// Span recorded a new value.
    SpanRecorded {
        span_id: tracing_core::span::Id,
        fields: Vec<Field>,
    },
}

/// Commands send from the `Server` to the `Aggregator`
pub enum Command {
    Instrument(Watcher),
}

pub struct Watcher {
    tx: mpsc::Sender<Result<instrument::Update>>,
}
