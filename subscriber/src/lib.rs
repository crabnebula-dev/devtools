use std::{
    net::{IpAddr, Ipv4Addr, SocketAddr},
    thread,
    time::{Duration, Instant, SystemTime},
};

use futures::FutureExt;
use tokio::{runtime, sync::mpsc};
use tracing_core::Interest;
use tracing_subscriber::{filter::FilterFn, prelude::*};

/// Default maximum capacity for the channel of events sent from a [`Layer`] to an [`Aggregator`]
///
/// When this capacity is exhausted, additional events will be dropped.
/// Decreasing this value will reduce memory usage, but may result in
/// events being dropped more frequently.
const DEFAULT_EVENT_BUFFER_CAPACITY: usize = 1024 * 100;

/// Default maximum capacity for the channel of events sent from a
/// [`Server`] to each subscribed client.
///
/// When this capacity is exhausted, the client is assumed to be inactive,
/// and may be disconnected.
const DEFAULT_CLIENT_BUFFER_CAPACITY: usize = 1024 * 4;

/// Default frequency for publishing events to clients.
const DEFAULT_PUBLISH_INTERVAL: Duration = Duration::from_secs(1);

/// Default IP address for a [`Server`].
const DEFAULT_IP: IpAddr = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));

/// Default port for a [`Server`].
const DEFAULT_PORT: u16 = 6669;

pub fn init() {
    let base_time = TimeAnchor::new();

    let (tx, events) = mpsc::channel(DEFAULT_EVENT_BUFFER_CAPACITY);
    let (subscribe, rpcs) = mpsc::channel(256);

    let aggregator = Aggregator {
        events,
        rpcs,
        publish_interval: DEFAULT_PUBLISH_INTERVAL,
        base_time,
        paused: false,
        trace_watchers: vec![],
        all_metadata: vec![],
        // new_metadata: vec![],
    };

    let server = Server {
        aggregator: Some(aggregator),
        addr: SocketAddr::new(DEFAULT_IP, DEFAULT_PORT),
        subscribe,
    };
    let layer = Layer { tx };

    let fmt_filter = std::env::var("RUST_LOG")
        .ok()
        .and_then(
            |log_filter| match log_filter.parse::<tracing_subscriber::filter::Targets>() {
                Ok(targets) => Some(targets),
                Err(e) => {
                    eprintln!(
                        "failed to parse filter environment variable `{}={:?}`: {}",
                        &"RUST_LOG", log_filter, e
                    );
                    None
                }
            },
        )
        .unwrap_or_else(|| {
            "error"
                .parse::<tracing_subscriber::filter::Targets>()
                .expect("`error` filter should always parse successfully")
        });

    fn console_filter(meta: &tracing::Metadata<'_>) -> bool {
        // events will have *targets* beginning with "runtime"
        if meta.is_event() {
            return meta.target().starts_with("runtime") || meta.target().starts_with("tokio");
        }

        // spans will have *names* beginning with "runtime". for backwards
        // compatibility with older Tokio versions, enable anything with the `tokio`
        // target as well.
        meta.name().starts_with("runtime.") || meta.target().starts_with("tokio")
    }

    let filter = FilterFn::new(console_filter as for<'r, 's> fn(&'r tracing::Metadata<'s>) -> bool);
    let layer = layer.with_filter(filter);

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
                server
                    .serve()
                    .await
                    .expect("console subscriber server failed")
            });
        })
        .expect("console subscriber could not spawn thread");

    tracing_subscriber::registry()
        .with(layer)
        .with(tracing_subscriber::fmt::layer().with_filter(fmt_filter))
        .init();
}

/// A [`tracing_subscriber::Layer`] that records [`tracing`]
/// spans and events emitted by the instrumented code.
///
/// Code emits [`tracing`] spans and events that represent asynchronous operations.
/// In addition the regular treatment of events,
/// this layer has special behaviour for well-known events emitted by the `tokio` and `tauri` crates.
///
/// The [`Layer`] collects these events and sends them for aggregation and filtering to the [`Aggregator`]
/// before they are either exported to clients by the gRPC [`Server`] or recorded to disk.
struct Layer {
    tx: mpsc::Sender<Event>,
}

/// Collects, aggregates and deduplicates events emitted within a specified interval (usually one second).
/// This is useful since most tracked metrics do don't change that frequently and metadata can be shared across events.
struct Aggregator {
    /// Channel of incoming events emitted by `TaskLayer`s.
    events: mpsc::Receiver<Event>,

    /// New incoming RPCs.
    rpcs: mpsc::Receiver<Command>,

    /// The interval at which new data updates are pushed to clients.
    publish_interval: Duration,

    /// Wether the aggregator should processes events
    // TODO make more fine grained so individual clients and metrics can be paused and resumed
    paused: bool,

    /// Currently active RPCs streaming trace events.
    trace_watchers: Vec<Watch<api::trace::TraceEvent>>,

    /// *All* metadata for task spans and user-defined spans that we care about.
    ///
    /// This is sent to new clients as part of the initial state.
    all_metadata: Vec<api::register_metadata::NewMetadata>,

    // /// *All* metadata for task spans and user-defined spans that we care about.
    // ///
    // /// This is sent to new clients as part of the initial state.
    // new_metadata: Vec<api::register_metadata::NewMetadata>,
    /// Used to anchor monotonic timestamps to a base `SystemTime`, to produce a
    /// timestamp that can be sent over the wire.
    base_time: TimeAnchor,
}

/// Exposes a gRPC server that exports the collected data to client.
struct Server {
    subscribe: mpsc::Sender<Command>,
    addr: SocketAddr,
    aggregator: Option<Aggregator>,
}

/// Intermediate message format used to send spans and events from the [`Layer`] to the [`Aggregator`]
enum Event {
    /// New span metadata was registered.
    Metadata(&'static tracing_core::Metadata<'static>),
    /// A span was created.
    NewSpan {
        at: Instant,
        span_id: tracing_core::span::Id,
    },
    /// A span was entered.
    EnterSpan {
        span_id: tracing_core::span::Id,
        at: Instant,
    },
    /// A span was exited.
    ExitSpan {
        span_id: tracing_core::span::Id,
        at: Instant,
    },
    /// A span was closed.
    CloseSpan {
        span_id: tracing_core::span::Id,
        at: Instant,
    },
}

struct Watch<T>(mpsc::Sender<Result<T, tonic::Status>>);

/// Commands control the [`Aggregator`]s behaviour. Commands are issued by clients and forwarded by the [`Server`].
enum Command {
    Trace(Watch<api::trace::TraceEvent>),
}

struct TimeAnchor {
    mono: Instant,
    sys: SystemTime,
}

impl TimeAnchor {
    pub(crate) fn new() -> Self {
        Self {
            mono: Instant::now(),
            sys: SystemTime::now(),
        }
    }

    pub(crate) fn to_system_time(&self, t: Instant) -> SystemTime {
        let dur = t
            .checked_duration_since(self.mono)
            .unwrap_or_else(|| Duration::from_secs(0));
        self.sys + dur
    }

    pub(crate) fn to_timestamp(&self, t: Instant) -> prost_types::Timestamp {
        self.to_system_time(t).into()
    }
}

impl Layer {
    fn send(&self, mk_event: impl FnOnce() -> Event) {
        use mpsc::error::TrySendError;

        // Return whether or not we actually sent the event.
        match self.tx.try_reserve() {
            Ok(permit) => {
                let event = mk_event();
                permit.send(event);
            }
            Err(TrySendError::Closed(_)) => {
                // we should warn here eventually, but nop for now because we
                // can't trigger tracing events...
                eprintln!("cannot emit event, aggregation task is not running")
            }
            Err(TrySendError::Full(_)) => {
                // this shouldn't happen, since we trigger a flush when
                // approaching the high water line...but if the executor wait
                // time is very high, maybe the aggregator task hasn't been
                // polled yet. so... eek?!
                // None

                // TODO track dropped events
                // dropped.fetch_add(1, Ordering::Release);
            }
        }

        // todo flush to clients when channel fills up
    }
}

impl<S> tracing_subscriber::Layer<S> for Layer
where
    S: tracing_core::subscriber::Subscriber,
{
    fn register_callsite(
        &self,
        _metadata: &'static tracing::Metadata<'static>,
    ) -> tracing_core::Interest {
        // TODO track callsite metadata

        Interest::always()
    }

    fn on_new_span(
        &self,
        _attrs: &tracing_core::span::Attributes<'_>,
        id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send(|| Event::NewSpan {
            span_id: id.clone(),
            at,
        });
    }

    fn on_enter(
        &self,
        id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send(|| Event::EnterSpan {
            span_id: id.clone(),
            at,
        });
    }

    fn on_exit(
        &self,
        id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send(|| Event::ExitSpan {
            span_id: id.clone(),
            at,
        });
    }

    fn on_close(
        &self,
        id: tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send(|| Event::CloseSpan {
            span_id: id.clone(),
            at,
        });
    }
}

impl Aggregator {
    async fn run(mut self) {
        let mut interval = tokio::time::interval(self.publish_interval);

        loop {
            let should_publish = tokio::select! {
                _ = interval.tick() => !self.paused,
                cmd = self.rpcs.recv() => {
                    match cmd {
                        Some(Command::Trace(subscription)) => {
                            self.add_trace_subscription(subscription);
                        },
                        None => {
                            tracing::debug!("rpc channel closed, terminating");
                            return;
                        }
                    };
                    false
                }
            };

            // drain and process buffered events.
            //
            // Note: we *don't* want to actually await the call to `recv` --- we
            // don't want the aggregator task to be woken on every event,
            // because it will then be woken when its own `poll` calls are
            // exited. that would result in a busy-loop. instead, we only want
            // to be woken when the flush interval has elapsed, or when the
            // channel is almost full.
            while let Some(event) = self.events.recv().now_or_never() {
                match event {
                    Some(event) => {
                        self.update_state(event);
                    }
                    // The channel closed, no more events will be emitted...time
                    // to stop aggregating.
                    None => {
                        tracing::debug!("event channel closed; terminating");
                        return;
                    }
                };
            }

            // flush data to clients, if there are any currently subscribed
            // watchers and we should send a new update.
            if !self.trace_watchers.is_empty() && should_publish {
                self.publish();
            }
        }
    }

    fn add_trace_subscription(&mut self, subscription: Watch<api::trace::TraceEvent>) {
        tracing::debug!("new trace subscription");

        let update = &api::trace::TraceEvent::register_metadata(self.all_metadata.clone());

        if subscription.update(update) {
            self.trace_watchers.push(subscription);
        }
    }

    /// Update the current state with data from a single event.
    fn update_state(&mut self, event: Event) {
        match event {
            Event::Metadata(meta) => {
                self.all_metadata.push(meta.into());
                // self.new_metadata.push(meta.into());

                let update = &api::trace::TraceEvent::register_metadata(self.all_metadata.clone());

                for subscription in &self.trace_watchers {
                    subscription.update(update);
                }
            }
            Event::NewSpan { at, span_id } => {
                let update = &api::trace::TraceEvent::new_span(api::Span {
                    id: Some(span_id.into()),
                    metadata_id: None,
                    fields: Vec::default(),
                    at: Some(self.base_time.to_timestamp(at)),
                });

                for subscription in &self.trace_watchers {
                    subscription.update(update);
                }
            }
            Event::EnterSpan { span_id, at } => {
                let update = &api::trace::TraceEvent::enter_span(
                    span_id.into(),
                    self.base_time.to_timestamp(at),
                );

                for subscription in &self.trace_watchers {
                    subscription.update(update);
                }
            }
            Event::ExitSpan { span_id, at } => {
                let update = &api::trace::TraceEvent::enter_span(
                    span_id.into(),
                    self.base_time.to_timestamp(at),
                );

                for subscription in &self.trace_watchers {
                    subscription.update(update);
                }
            }
            Event::CloseSpan { span_id, at } => {
                let update = &api::trace::TraceEvent::enter_span(
                    span_id.into(),
                    self.base_time.to_timestamp(at),
                );

                for subscription in &self.trace_watchers {
                    subscription.update(update);
                }
            }
        }
    }

    /// Publish the current state to all active watchers.
    ///
    /// This drops any watchers which have closed the RPC, or whose update
    /// channel has filled up.
    fn publish(&mut self) {
        // This currently is a no-op as all event types (tracing events) are published in realtime, so no aggregated metrics need to be published
        // we keep this around for later
    }
}

impl<T: Clone> Watch<T> {
    // TODO make return type more meaningful
    fn update(&self, update: &T) -> bool {
        if let Ok(reserve) = self.0.try_reserve() {
            reserve.send(Ok(update.clone()));
            true
        } else {
            false
        }
    }
}

impl Server {
    pub async fn serve(mut self) -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
        let mut builder = tonic::transport::Server::default();

        let aggregate = self
            .aggregator
            .take()
            .expect("cannot start server multiple times");
        let aggregate = spawn_named(aggregate.run(), "console::aggregate");
        let addr = self.addr.clone();
        let router = builder.add_service(api::trace::trace_server::TraceServer::new(self));

        let serve = router.serve(addr);
        let res = spawn_named(serve, "console::serve").await;

        aggregate.abort();
        res?.map_err(Into::into)
    }
}

#[tonic::async_trait]
impl api::trace::trace_server::Trace for Server {
    type WatchStream =
        tokio_stream::wrappers::ReceiverStream<Result<api::trace::TraceEvent, tonic::Status>>;

    async fn watch(
        &self,
        req: tonic::Request<api::trace::WatchRequest>,
    ) -> Result<tonic::Response<Self::WatchStream>, tonic::Status> {
        match req.remote_addr() {
            Some(addr) => tracing::debug!(client.addr = %addr, "starting a new watch"),
            None => tracing::debug!(client.addr = %"<unknown>", "starting a new watch"),
        }

        // reserve capacity to message the aggregator
        let permit = self.subscribe.reserve().await.map_err(|_| {
            tonic::Status::internal("cannot start new watch, aggregation task is not running")
        })?;

        // create output channel and send tx to the aggregator for tracking
        let (tx, rx) = mpsc::channel(DEFAULT_CLIENT_BUFFER_CAPACITY);
        permit.send(Command::Trace(Watch(tx)));

        tracing::debug!("watch started");

        let stream = tokio_stream::wrappers::ReceiverStream::new(rx);
        Ok(tonic::Response::new(stream))
    }

    async fn pause(
        &self,
        _req: tonic::Request<api::trace::PauseRequest>,
    ) -> Result<tonic::Response<api::trace::PauseResponse>, tonic::Status> {
        todo!()
    }

    async fn resume(
        &self,
        _req: tonic::Request<api::trace::ResumeRequest>,
    ) -> Result<tonic::Response<api::trace::ResumeResponse>, tonic::Status> {
        todo!()
    }
}

#[track_caller]
pub(crate) fn spawn_named<T>(
    task: impl std::future::Future<Output = T> + Send + 'static,
    _name: &str,
) -> tokio::task::JoinHandle<T>
where
    T: Send + 'static,
{
    #[cfg(tokio_unstable)]
    return tokio::task::Builder::new().name(_name).spawn(task).unwrap();

    #[cfg(not(tokio_unstable))]
    tokio::spawn(task)
}

// use std::{
//     net::{IpAddr, SocketAddr, SocketAddrV4, SocketAddrV6},
//     path::{Path, PathBuf},
//     time::Duration,
// };

// use tokio::sync::mpsc;

// /// Default maximum capacity for the channel of events sent from a
// /// [`ConsoleLayer`] to a [`Server`].
// ///
// /// When this capacity is exhausted, additional events will be dropped.
// /// Decreasing this value will reduce memory usage, but may result in
// /// events being dropped more frequently.
// ///
// /// See also [`Builder::event_buffer_capacity`].
// const DEFAULT_EVENT_BUFFER_CAPACITY: usize = 1024 * 100;

// /// Default maximum capacity for th echannel of events sent from a
// /// [`Server`] to each subscribed client.
// ///
// /// When this capacity is exhausted, the client is assumed to be inactive,
// /// and may be disconnected.
// ///
// /// See also [`Builder::client_buffer_capacity`].
// const DEFAULT_CLIENT_BUFFER_CAPACITY: usize = 1024 * 4;

// /// Default frequency for publishing events to clients.
// pub const DEFAULT_PUBLISH_INTERVAL: Duration = Duration::from_millis(250);

// enum Command {
//     Watch(mpsc::Sender<Result<api::trace::TraceEvent, tonic::Status>>),

// }

// /// Specifies the address on which a [`Server`] should listen.
// ///
// /// This type is passed as an argument to the [`Builder::server_addr`]
// /// method, and may be either a TCP socket address, or a [Unix domain socket]
// /// (UDS) address. Unix domain sockets are only supported on Unix-compatible
// /// operating systems, such as Linux, BSDs, and macOS.
// ///
// /// [`Server`]: crate::Server
// /// [Unix domain socket]: https://en.wikipedia.org/wiki/Unix_domain_socket
// #[derive(Clone, Debug)]
// #[non_exhaustive]
// pub enum ServerAddr {
//     /// A TCP address.
//     Tcp(SocketAddr),
//     /// A Unix socket address.
//     #[cfg(unix)]
//     Unix(PathBuf),
// }

// impl From<SocketAddr> for ServerAddr {
//     fn from(addr: SocketAddr) -> ServerAddr {
//         ServerAddr::Tcp(addr)
//     }
// }

// impl From<SocketAddrV4> for ServerAddr {
//     fn from(addr: SocketAddrV4) -> ServerAddr {
//         ServerAddr::Tcp(addr.into())
//     }
// }

// impl From<SocketAddrV6> for ServerAddr {
//     fn from(addr: SocketAddrV6) -> ServerAddr {
//         ServerAddr::Tcp(addr.into())
//     }
// }

// impl<I> From<(I, u16)> for ServerAddr
// where
//     I: Into<IpAddr>,
// {
//     fn from(pieces: (I, u16)) -> ServerAddr {
//         ServerAddr::Tcp(pieces.into())
//     }
// }

// #[cfg(unix)]
// impl From<PathBuf> for ServerAddr {
//     fn from(path: PathBuf) -> ServerAddr {
//         ServerAddr::Unix(path)
//     }
// }

// #[cfg(unix)]
// impl<'a> From<&'a Path> for ServerAddr {
//     fn from(path: &'a Path) -> ServerAddr {
//         ServerAddr::Unix(path.to_path_buf())
//     }
// }

// struct Server {
//     commands: mpsc::Sender<Command>,
//     addr: ServerAddr,
// }

// #[tonic::async_trait]
// impl api::trace::trace_server::Trace for Server {
//     type WatchStream =
//         tokio_stream::wrappers::ReceiverStream<Result<api::trace::TraceEvent, tonic::Status>>;

//     async fn watch(
//         &self,
//         req: tonic::Request<api::trace::WatchRequest>,
//     ) -> Result<tonic::Response<Self::WatchStream>, tonic::Status> {
//
//     }

//     async fn pause(
//         &self,
//         _req: tonic::Request<api::trace::PauseRequest>,
//     ) -> Result<tonic::Response<api::trace::PauseResponse>, tonic::Status> {
//         self.commands.send(Command::Pause).await.map_err(|_| {
//             tonic::Status::internal("cannot pause, aggregation task is not running")
//         })?;

//         Ok(tonic::Response::new(api::trace::PauseResponse {}))
//     }

//     async fn resume(
//         &self,
//         _req: tonic::Request<api::trace::ResumeRequest>,
//     ) -> Result<tonic::Response<api::trace::ResumeResponse>, tonic::Status> {
//         self.commands.send(Command::Resume).await.map_err(|_| {
//             tonic::Status::internal("cannot resume, aggregation task is not running")
//         })?;

//         Ok(tonic::Response::new(api::trace::ResumeResponse {}))
//     }
// }

// struct Aggregator {
//     /// Channel of incoming events emitted by `TaskLayer`s.
//     events: mpsc::Receiver<Event>,

//     // New incoming commands
//     rpcs: mpsc::Receiver<Command>,

//     /// Currently active RPCs streaming trace events.
//     watchers: Vec<mpsc::Sender<api::trace::TraceEvent>>,

//     trace_events: Vec<api::trace::TraceEvent>,

//     /// The interval at which new data updates are pushed to clients.
//     publish_interval: Duration,

//     paused: bool,
// }

// impl Aggregator {
//     pub async fn run(mut self) {
//         let mut publish = tokio::time::interval(self.publish_interval);

//         loop {
//             let should_send = tokio::select! {
//                 _ = publish.tick() => !self.paused,

//                 cmd = self.rpcs.recv() => {
//                     match cmd {
//                         Some(Command::Watch(subscription)) => self.add_trace_subscription(subscription),
//                         Some(Command::Pause) => {
//                             self.paused = true
//                         },
//                         Some(Command::Resume) => {
//                             self.paused = false
//                         },
//                         None => {
//                             tracing::debug!("rpc channel closed, terminating");
//                             return;
//                         }
//                     };

//                     false
//                 }
//             };

//             // drain and aggregate buffered events.
//             //
//             // Note: we *don't* want to actually await the call to `recv` --- we
//             // don't want the aggregator task to be woken on every event,
//             // because it will then be woken when its own `poll` calls are
//             // exited. that would result in a busy-loop. instead, we only want
//             // to be woken when the flush interval has elapsed, or when the
//             // channel is almost full.
//             let mut drained = false;
//             while let Some(event) = self.events.recv().now_or_never() {
//                 match event {
//                     Some(event) => {
//                         self.update_state(event);
//                         drained = true;
//                     }
//                     // The channel closed, no more events will be emitted...time
//                     // to stop aggregating.
//                     None => {
//                         tracing::debug!("event channel closed; terminating");
//                         return;
//                     }
//                 };
//             }

//             // potentially flush data to clients
//             // flush data to clients, if there are any currently subscribed
//             // watchers and we should send a new update.
//             if !self.watchers.is_empty() && should_send {
//                 self.publish();
//             }
//             // self.cleanup_closed();
//             // if drained {
//             //     self.shared.flush.has_flushed();
//             // }
//         }
//     }

//     fn add_trace_subscription(
//         &mut self,
//         subscription: mpsc::Sender<Result<api::trace::TraceEvent, tonic::Status>>,
//     ) {
//         tracing::debug!("new trace subscription");

//         // let update = api::trace::TraceEvent { event: todo!() };

//         // if let Ok(permit) = subscription.try_reserve() {
//         //     permit.send(update)
//         // }

//         // let trace_update = Some(self.trace_update());
//         // let now = Instant

//         todo!()
//     }

//     fn publish(&mut self) {}
// }
