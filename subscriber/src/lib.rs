use api::instrument::Interests;
use futures::FutureExt;
use std::{
    mem,
    net::{IpAddr, Ipv4Addr, SocketAddr},
    sync::{
        atomic::{AtomicBool, AtomicUsize, Ordering},
        Arc,
    },
    thread,
    time::{Duration, Instant, SystemTime},
};
use tokio::{
    runtime,
    sync::{mpsc, Notify},
};
use tracing_subscriber::{filter, prelude::*};

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

const FILTER_ENV_VAR: &str = "RUST_LOG";

#[derive(Debug, Default)]
struct Shared {
    /// Used to notify the aggregator task when the event buffer should be
    /// flushed.
    flush: Flush,

    /// A counter of how many trace events were dropped because the event buffer was at capacity
    dropped_trace_events: AtomicUsize,
}

#[derive(Debug, Default)]
struct Flush {
    should_flush: Notify,
    triggered: AtomicBool,
}

struct Layer {
    tx: mpsc::Sender<Event>,

    shared: Arc<Shared>,

    /// When the channel capacity goes under this number, a flush in the aggregator
    /// will be triggered.
    flush_threshold: usize,
}

struct Aggregator {
    /// Channel of incoming events emitted by `TaskLayer`s.
    events: mpsc::Receiver<Event>,

    /// New incoming RPCs.
    rpcs: mpsc::Receiver<Command>,

    shared: Arc<Shared>,

    /// Used to anchor monotonic timestamps to a base `SystemTime`, to produce a
    /// timestamp that can be sent over the wire.
    base_time: TimeAnchor,

    // /// Which sources should be tracked
    // enabled: Sources,
    watchers: Vec<Watch<api::instrument::Update>>,

    /// *All* metadata for task spans and user-defined spans that we care about.
    ///
    /// This is sent to new clients as part of the initial state.
    all_metadata: Vec<api::register_metadata::NewMetadata>,

    /// *New* metadata that was registered since the last state update.
    ///
    /// This is emptied on every state update.
    new_metadata: Vec<api::register_metadata::NewMetadata>,

    trace_events: Vec<api::trace::TraceEvent>,
}

struct Server {
    tx: mpsc::Sender<Command>,
    addr: SocketAddr,
}

enum Event {
    Metadata(&'static tracing_core::Metadata<'static>),
    Event {
        at: Instant,
        // fields
        // metadata?
    },
    NewSpan {
        id: tracing_core::span::Id,
        at: Instant,
        // fields
        // metadata?
    },
    EnterSpan {
        id: tracing_core::span::Id,
        at: Instant,
    },
    ExitSpan {
        id: tracing_core::span::Id,
        at: Instant,
    },
    CloseSpan {
        id: tracing_core::span::Id,
        at: Instant,
    },
}

#[derive(Debug)]
struct Watch<T> {
    tx: mpsc::Sender<Result<T, tonic::Status>>,
    interests: Interests,
}

enum Command {
    Instrument(Watch<api::instrument::Update>),
}

enum Include {
    All,
    Update,
}

impl Layer {
    pub fn new(shared: Arc<Shared>, tx: mpsc::Sender<Event>) -> Self {
        Self {
            shared,
            tx,
            flush_threshold: DEFAULT_EVENT_BUFFER_CAPACITY / 2,
        }
    }

    fn send_event(&self, dropped: &AtomicUsize, mk_event: impl FnOnce() -> Event) {
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
            }
            Err(TrySendError::Full(_)) => {
                // this shouldn't happen, since we trigger a flush when
                // approaching the high water line...but if the executor wait
                // time is very high, maybe the aggregator task hasn't been
                // polled yet. so... eek?!

                dropped.fetch_add(1, Ordering::Release);
            }
        };

        let capacity = self.tx.capacity();
        if capacity <= self.flush_threshold {
            self.shared.flush.trigger();
        }
    }
}

impl<S> tracing_subscriber::Layer<S> for Layer
where
    S: tracing_core::subscriber::Subscriber,
{
    fn register_callsite(
        &self,
        meta: &'static tracing::Metadata<'static>,
    ) -> tracing_core::Interest {
        self.send_event(&self.shared.dropped_trace_events, || Event::Metadata(meta));

        tracing_core::Interest::always()
    }

    fn on_new_span(
        &self,
        _attrs: &tracing_core::span::Attributes<'_>,
        id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_trace_events, || Event::NewSpan {
            id: id.clone(),
            at,
        })
    }

    fn on_record(
        &self,
        _span: &tracing_core::span::Id,
        _values: &tracing_core::span::Record<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
    }

    fn on_follows_from(
        &self,
        _span: &tracing_core::span::Id,
        _follows: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
    }

    fn on_event(
        &self,
        _event: &tracing::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_trace_events, || Event::Event { at })
    }

    fn on_enter(
        &self,
        id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_trace_events, || Event::EnterSpan {
            id: id.clone(),
            at,
        })
    }

    fn on_exit(
        &self,
        id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_trace_events, || Event::ExitSpan {
            id: id.clone(),
            at,
        })
    }

    fn on_close(
        &self,
        id: tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_trace_events, || Event::CloseSpan {
            id,
            at,
        })
    }
}

impl Aggregator {
    /// Default frequency for publishing events to clients.
    const DEFAULT_PUBLISH_INTERVAL: Duration = Duration::from_secs(1);

    pub fn new(
        shared: Arc<Shared>,
        events: mpsc::Receiver<Event>,
        rpcs: mpsc::Receiver<Command>,
    ) -> Self {
        Self {
            shared,
            events,
            rpcs,
            base_time: TimeAnchor::new(),
            // enabled: Sources::empty(),
            watchers: Vec::new(),
            all_metadata: Vec::new(),
            new_metadata: Vec::new(),
            trace_events: Vec::new(),
        }
    }

    pub async fn run(mut self) {
        let mut interval = tokio::time::interval(Self::DEFAULT_PUBLISH_INTERVAL);

        loop {
            let should_publish = tokio::select! {
                _ = interval.tick() => true,

                _ = self.shared.flush.should_flush.notified() => {
                    tracing::debug!("approaching capacity; draining buffer");

                    false
                }

                cmd = self.rpcs.recv() => {
                    match cmd {
                        Some(Command::Instrument(watcher)) => {
                            self.add_instrument_watcher(watcher)
                        },
                        // Some(Command::Pause(sources)) => {
                        //     self.enabled.remove(sources);
                        // },
                        // Some(Command::Resume(sources)) => {
                        //     self.enabled.insert(sources);
                        // },
                        None => {
                            tracing::debug!("rpc channel closed, terminating");
                            return;
                        },
                    };

                    false
                }
            };

            // println!("aggregator loop {:?}", self.new_metadata);

            let mut drained = false;
            while let Some(event) = self.events.recv().now_or_never() {
                match event {
                    Some(event) => {
                        self.update_state(event);
                        drained = true;
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
            if !self.watchers.is_empty() && should_publish {
                self.publish();
            }
            // self.cleanup_closed();
            if drained {
                self.shared.flush.has_flushed();
            }
        }
    }

    fn add_instrument_watcher(&mut self, watcher: Watch<api::instrument::Update>) {
        tracing::debug!("new instrument watcher");

        let new_metadata =
            watcher
                .interests
                .contains(Interests::Metadata)
                .then_some(api::RegisterMetadata {
                    metadata: self.all_metadata.clone(),
                });

        let trace_update = watcher
            .interests
            .contains(Interests::Trace)
            .then_some(self.trace_update(Include::All));

        let now = Instant::now();

        let update = &api::instrument::Update {
            new_metadata,
            trace_update,
            now: Some(self.base_time.to_timestamp(now)),
        };

        // Send the initial state --- if this fails, the watcher is already dead
        if watcher.update(update) {
            self.watchers.push(watcher);
            // self.enabled |= sources;
        }
    }

    fn update_state(&mut self, event: Event) {
        match event {
            Event::NewSpan { id, at } => {
                let span = api::Span {
                    id: Some(id.into()),
                    metadata_id: None,
                    fields: Vec::new(),
                    at: Some(self.base_time.to_timestamp(at)),
                };

                self.trace_events
                    .push(api::trace::TraceEvent::new_span(span));
            }
            Event::EnterSpan { id, at } => {
                let event =
                    api::trace::TraceEvent::enter_span(id.into(), self.base_time.to_timestamp(at));

                self.trace_events.push(event);
            }
            Event::ExitSpan { id, at } => {
                let event =
                    api::trace::TraceEvent::exit_span(id.into(), self.base_time.to_timestamp(at));

                self.trace_events.push(event);
            }
            Event::CloseSpan { id, at } => {
                let event =
                    api::trace::TraceEvent::close_span(id.into(), self.base_time.to_timestamp(at));

                self.trace_events.push(event);
            }
            Event::Event { at } => {
                let event = api::trace::TraceEvent::event(api::trace::trace_event::Event {
                    metadata_id: None,
                    fields: Vec::new(),
                    at: Some(self.base_time.to_timestamp(at)),
                });

                self.trace_events.push(event);
            }
            Event::Metadata(meta) => {
                self.all_metadata.push(meta.into());
                self.new_metadata.push(meta.into());
            }
        }
    }

    fn publish(&mut self) {
        let new_metadata = if !self.new_metadata.is_empty() {
            Some(api::RegisterMetadata {
                metadata: mem::take(&mut self.new_metadata),
            })
        } else {
            None
        };

        let trace_update = if !self.trace_events.is_empty() {
            Some(self.trace_update(Include::Update))
        } else {
            None
        };

        let now = Instant::now();

        let update = &api::instrument::Update {
            now: Some(self.base_time.to_timestamp(now)),
            trace_update,
            new_metadata,
        };

        self.watchers.retain(|watcher| watcher.update(update));
        self.watchers.shrink_to_fit();
    }

    fn trace_update(&mut self, include: Include) -> api::trace::TraceUpdate {
        let new_events = match include {
            Include::All => self.trace_events.clone(),
            Include::Update => mem::take(&mut self.trace_events),
        };

        api::trace::TraceUpdate {
            new_events,
            dropped_events: self.shared.dropped_trace_events.swap(0, Ordering::AcqRel) as u64,
        }
    }
}

impl Server {
    pub const DEFAULT_IP: IpAddr = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));

    pub const DEFAULT_PORT: u16 = 6669;

    pub fn new(tx: mpsc::Sender<Command>) -> Self {
        Self {
            tx,
            addr: SocketAddr::new(Self::DEFAULT_IP, Self::DEFAULT_PORT),
        }
    }

    pub async fn serve(self) -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
        let addr = self.addr.clone();

        tonic::transport::Server::builder()
            .add_service(api::instrument::instrument_server::InstrumentServer::new(
                self,
            ))
            .serve(addr)
            .await?;

        Ok(())
    }
}

#[tonic::async_trait]
impl api::instrument::instrument_server::Instrument for Server {
    type WatchUpdatesStream =
        tokio_stream::wrappers::ReceiverStream<Result<api::instrument::Update, tonic::Status>>;

    async fn watch_updates(
        &self,
        req: tonic::Request<api::instrument::InstrumentRequest>,
    ) -> Result<tonic::Response<Self::WatchUpdatesStream>, tonic::Status> {
        match req.remote_addr() {
            Some(addr) => tracing::debug!(client.addr = %addr, "starting a new watch"),
            None => tracing::debug!(client.addr = %"<unknown>", "starting a new watch"),
        }

        // reserve capacity to message the aggregator
        let permit = self.tx.reserve().await.map_err(|_| {
            tonic::Status::internal("cannot start new watch, aggregation task is not running")
        })?;

        // create output channel and send tx to the aggregator for tracking
        let (tx, rx) = mpsc::channel(DEFAULT_CLIENT_BUFFER_CAPACITY);

        let interests = Interests::from_bits(req.into_inner().interests)
            .ok_or(tonic::Status::invalid_argument("could not parse sources"))?;

        permit.send(Command::Instrument(Watch { tx, interests }));

        tracing::debug!("watch started");

        let stream = tokio_stream::wrappers::ReceiverStream::new(rx);
        Ok(tonic::Response::new(stream))
    }

    async fn update_interests(
        &self,
        _req: tonic::Request<api::instrument::UpdateInterestsRequest>,
    ) -> Result<tonic::Response<api::instrument::UpdateInterestsResponse>, tonic::Status> {
        todo!()
        // let sources = Interests::from_bits(req.into_inner().interests)
        //     .ok_or(tonic::Status::invalid_argument("could not parse sources"))?;

        // self.tx.send(Command::Pause(sources)).await.map_err(|_| {
        //     tonic::Status::internal("cannot update interests, aggregation task is not running")
        // })?;

        // Ok(tonic::Response::new(api::instrument::UpdateInterestsResponse {}))
    }

    // async fn pause(
    //     &self,
    //     req: tonic::Request<api::instrument::PauseRequest>,
    // ) -> Result<tonic::Response<api::instrument::PauseResponse>, tonic::Status> {
    //     let sources = Sources::from_bits(req.into_inner().sources)
    //         .ok_or(tonic::Status::invalid_argument("could not parse sources"))?;

    //     self.tx.send(Command::Pause(sources)).await.map_err(|_| {
    //         tonic::Status::internal("cannot pause, aggregation task is not running")
    //     })?;

    //     Ok(tonic::Response::new(api::instrument::PauseResponse {}))
    // }

    // async fn resume(
    //     &self,
    //     req: tonic::Request<api::instrument::ResumeRequest>,
    // ) -> Result<tonic::Response<api::instrument::ResumeResponse>, tonic::Status> {
    //     let sources = Sources::from_bits(req.into_inner().sources)
    //         .ok_or(tonic::Status::invalid_argument("could not parse sources"))?;

    //     self.tx.send(Command::Resume(sources)).await.map_err(|_| {
    //         tonic::Status::internal("cannot pause, aggregation task is not running")
    //     })?;

    //     Ok(tonic::Response::new(api::instrument::ResumeResponse {}))
    // }
}

impl Flush {
    pub(crate) fn trigger(&self) {
        if self
            .triggered
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .is_ok()
        {
            self.should_flush.notify_one();
        } else {
            // someone else already did it, that's fine...
        }
    }

    /// Indicates that the buffer has been successfully flushed.
    fn has_flushed(&self) {
        let _ = self
            .triggered
            .compare_exchange(true, false, Ordering::AcqRel, Ordering::Acquire);
    }
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

pub fn init() {
    let shared = Arc::new(Shared::default());

    let (event_tx, events) = mpsc::channel(DEFAULT_EVENT_BUFFER_CAPACITY);
    let (command_tx, rpcs) = mpsc::channel(256);

    let layer = Layer::new(shared.clone(), event_tx);
    let aggregator = Aggregator::new(shared.clone(), events, rpcs);
    let server = Server::new(command_tx);

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
                let aggregate = spawn_named(aggregator.run(), "devtools::aggregate");

                spawn_named(server.serve(), "devtools::serve")
                    .await
                    .unwrap()
                    .unwrap();

                aggregate.abort();
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
        .with(layer)
        .with(tracing_subscriber::fmt::layer().with_filter(fmt_filter))
        .init()
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
