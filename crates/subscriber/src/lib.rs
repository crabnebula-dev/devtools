mod aggregator;
mod builder;
mod callsites;
mod error;
mod id_map;
mod layer;
mod server;
mod stats;
mod util;
mod visitors;
mod zeroconf;

use aggregator::Flush;
use std::{
    sync::{atomic::AtomicUsize, Arc},
    time::Instant,
};
use tokio::sync::mpsc;
use util::TimeAnchor;
use wire::instrument::Interests;

pub(crate) type Result<T> = std::result::Result<T, Error>;

pub use builder::Builder;
pub use error::Error;

pub fn init<A: tauri::Assets>(tauri_ctx: &tauri::Context<A>) {
    Builder::default().init(tauri_ctx.package_info().clone())
}

pub fn try_init<A: tauri::Assets>(tauri_ctx: &tauri::Context<A>) -> Result<()> {
    Builder::default().try_init(tauri_ctx.package_info().clone())
}

#[derive(Debug, Default)]
struct Shared {
    /// Used to notify the aggregator task when the event buffer should be
    /// flushed.
    flush: Flush,

    /// A counter of how many IPC events were dropped because the event buffer was at capacity.
    dropped_ipc_events: AtomicUsize,

    /// A counter of how many trace events were dropped because the event buffer was at capacity
    dropped_log_events: AtomicUsize,

    dropped_misc_events: AtomicUsize,
}

enum Event {
    Metadata(&'static tracing_core::Metadata<'static>),
    LogEvent {
        metadata: &'static tracing_core::Metadata<'static>,
        fields: Vec<wire::Field>,
        at: Instant,
    },
    IPCRequestInitiated {
        id: tracing_core::span::Id,
        cmd: String,
        kind: wire::ipc::request::Kind,
        stats: Arc<stats::IPCRequestStats>,
        metadata: &'static tracing_core::Metadata<'static>,
        fields: Vec<wire::Field>,
        handler: wire::Location,
    },
}

enum Command {
    Instrument(Watch<wire::instrument::Update>),
}

#[derive(Debug, Clone, Copy)]
enum Include {
    All,
    UpdateOnly,
}

#[derive(Debug)]
struct Watch<T> {
    tx: mpsc::Sender<std::result::Result<T, tonic::Status>>,
    interests: Interests,
}

impl<T: Clone> Watch<T> {
    // TODO make return type more meaningful
    fn update(&self, update: &T) -> bool {
        if let Ok(reserve) = self.tx.try_reserve() {
            reserve.send(Ok(update.clone()));
            true
        } else {
            false
        }
    }
}

pub(crate) trait ToProto {
    type Output;
    fn to_proto(&self, base_time: &TimeAnchor) -> Self::Output;
}

pub(crate) trait FromProto {
    type Input;
    fn from_proto(proto: Self::Input) -> Self;
}

pub(crate) trait Unsent {
    fn take_unsent(&self) -> bool;
    fn is_unsent(&self) -> bool;
}

impl<T: ToProto> ToProto for Arc<T> {
    type Output = T::Output;

    fn to_proto(&self, base_time: &TimeAnchor) -> Self::Output {
        self.as_ref().to_proto(base_time)
    }
}

impl<T: Unsent> Unsent for Arc<T> {
    fn take_unsent(&self) -> bool {
        self.as_ref().take_unsent()
    }

    fn is_unsent(&self) -> bool {
        self.as_ref().is_unsent()
    }
}
