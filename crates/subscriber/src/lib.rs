mod aggregator;
mod callsites;
mod id_map;
mod layer;
mod server;
mod stats;
mod util;
mod visitors;
mod zeroconf;

use aggregator::{Aggregator, Flush};
use layer::Layer;
use server::Server;
use std::{
    sync::{atomic::AtomicUsize, Arc},
    thread,
    time::Instant,
};
use tokio::{runtime, sync::mpsc};
use tracing_subscriber::{filter, prelude::*};
use util::{spawn_named, TimeAnchor};
use wire::instrument::Interests;
use zeroconf::Zeroconf;

const FILTER_ENV_VAR: &str = "RUST_LOG";

pub fn init<A: tauri::Assets>(ctx: &tauri::Context<A>) {
    try_init(ctx).unwrap()
}

pub fn try_init<A: tauri::Assets>(
    ctx: &tauri::Context<A>,
) -> Result<(), Box<dyn std::error::Error>> {
    let shared = Arc::new(Shared::default());

    let (event_tx, events) = mpsc::channel(Layer::DEFAULT_EVENT_BUFFER_CAPACITY);
    let (command_tx, rpcs) = mpsc::channel(256);

    let layer = Layer::new(shared.clone(), event_tx);
    let aggregator = Aggregator::new(shared.clone(), events, rpcs);
    let server = Server::new(command_tx, ctx.package_info().clone());
    let beacon = Zeroconf::new_from_env(Server::DEFAULT_PORT, ctx.package_info().clone()).unwrap();

    thread::Builder::new()
        .name("console_subscriber".into())
        .spawn(move || {
            let _subscriber_guard;
            // if !self_trace {
            _subscriber_guard =
                tracing::subscriber::set_default(tracing_core::subscriber::NoSubscriber::default());
            // }
            let runtime = runtime::Builder::new_current_thread()
                .enable_io()
                .enable_time()
                .build()
                .expect("console subscriber runtime initialization failed");

            runtime.block_on(async move {
                let mdns = spawn_named(beacon.run(), "devtools::mdns");

                let aggregate = spawn_named(aggregator.run(), "devtools::aggregate");

                spawn_named(server.serve(), "devtools::serve")
                    .await
                    .unwrap()
                    .unwrap();

                aggregate.abort();
                mdns.abort();
            });
        })
        .expect("console subscriber could not spawn thread");

    type Filter = filter::Targets;

    let fmt_filter = std::env::var(FILTER_ENV_VAR)
        .ok()
        .and_then(|log_filter| match log_filter.parse::<Filter>() {
            Ok(targets) => Some(targets),
            Err(e) => {
                eprintln!(
                    "failed to parse filter environment variable `{}={:?}`: {}",
                    FILTER_ENV_VAR, log_filter, e
                );
                None
            }
        })
        .unwrap_or_else(|| {
            "error"
                .parse::<Filter>()
                .expect("`error` filter should always parse successfully")
        });

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer().with_filter(fmt_filter.clone()))
        .with(layer.with_filter(tracing_subscriber::filter::LevelFilter::DEBUG))
        .try_init()?;

    Ok(())
}

#[derive(Debug, Default)]
struct Shared {
    /// Used to notify the aggregator task when the event buffer should be
    /// flushed.
    flush: Flush,

    /// A counter of how many trace events were dropped because the event buffer was at capacity
    dropped_log_events: AtomicUsize,

    /// A counter of how many IPC events were dropped because the event buffer was at capacity
    dropped_ipc_events: AtomicUsize,
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
    tx: mpsc::Sender<Result<T, tonic::Status>>,
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

pub trait FromProto {
    type Input;
    fn from_proto(proto: Self::Input) -> Self;
}

pub trait Unsent {
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
