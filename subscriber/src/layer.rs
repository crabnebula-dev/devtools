use std::{
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::{Duration, Instant},
};

use tokio::sync::mpsc;
use tracing_core::Subscriber;
use tracing_subscriber::registry::LookupSpan;

use crate::{
    callsites::Callsites,
    stats,
    util::TimeAnchor,
    visitors::{FieldVisitor, IPCVisitor},
    Event, Shared,
};

pub struct Layer {
    tx: mpsc::Sender<Event>,

    shared: Arc<Shared>,

    /// When the channel capacity goes under this number, a flush in the aggregator
    /// will be triggered.
    flush_threshold: usize,

    /// Used to anchor monotonic timestamps to a base `SystemTime`, to produce a
    /// timestamp that can be sent over the wire.
    base_time: TimeAnchor,

    /// Set of callsites for spans representing ongoing IPC requests
    ///
    /// Currently spans are emitted from within the `tauri` crate but also from within user code (through macros)
    /// so this number needs to be quite large (there are as many callsites are there are commands)
    /// TODO make this smaller once all callsites are contained in the tauri crate
    ipc_callsites: Callsites<32>,

    /// Set of callsites for spans representing spawned tasks.
    ///
    /// For task spans, each runtime these will have like, 1-5 callsites in it, max, so
    /// 8 should be plenty. If several runtimes are in use, we may have to spill
    /// over into the backup hashmap, but it's unlikely.
    spawn_callsites: Callsites<8>,

    /// Set of callsites for events representing waker operations.
    ///
    /// 16 is probably a reasonable number of waker ops; it's a bit generous if
    /// there's only one async runtime library in use, but if there are multiple,
    /// they might all have their own sets of waker ops.
    waker_callsites: Callsites<16>,

    /// Maximum value for the poll time histogram.
    ///
    /// By default, this is one second.
    max_poll_duration_nanos: u64,

    /// Maximum value for the scheduled time histogram.
    ///
    /// By default, this is one second.
    max_scheduled_duration_nanos: u64,
}

impl Layer {
    /// Default maximum capacity for the channel of events sent from a
    /// [`ConsoleLayer`] to a [`Server`].
    ///
    /// When this capacity is exhausted, additional events will be dropped.
    /// Decreasing this value will reduce memory usage, but may result in
    /// events being dropped more frequently.
    ///
    /// See also [`Builder::event_buffer_capacity`].
    pub const DEFAULT_EVENT_BUFFER_CAPACITY: usize = 1024 * 100;

    /// The default maximum value for task poll duration histograms.
    ///
    /// Any poll duration exceeding this will be clamped to this value. By
    /// default, the maximum poll duration is one second.
    pub const DEFAULT_POLL_DURATION_MAX: Duration = Duration::from_secs(1);

    /// The default maximum value for the task scheduled duration histogram.
    ///
    /// Any scheduled duration (the time from a task being woken until it is next
    /// polled) exceeding this will be clamped to this value. By default, the
    /// maximum scheduled duration is one second.
    pub const DEFAULT_SCHEDULED_DURATION_MAX: Duration = Duration::from_secs(1);

    pub(crate) fn new(shared: Arc<Shared>, tx: mpsc::Sender<Event>) -> Self {
        Self {
            shared,
            tx,
            flush_threshold: Self::DEFAULT_EVENT_BUFFER_CAPACITY / 2,
            base_time: TimeAnchor::new(),
            ipc_callsites: Callsites::default(),
            spawn_callsites: Callsites::default(),
            waker_callsites: Callsites::default(),
            max_poll_duration_nanos: Self::DEFAULT_POLL_DURATION_MAX.as_nanos() as u64,
            max_scheduled_duration_nanos: Self::DEFAULT_SCHEDULED_DURATION_MAX.as_nanos() as u64,
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

    fn is_ipc_request(&self, meta: &'static tracing_core::Metadata<'static>) -> bool {
        self.ipc_callsites.contains(meta)
    }

    fn is_spawn(&self, meta: &'static tracing_core::Metadata<'static>) -> bool {
        self.spawn_callsites.contains(meta)
    }
}

impl<S> tracing_subscriber::Layer<S> for Layer
where
    S: Subscriber + for<'a> LookupSpan<'a>,
{
    fn register_callsite(
        &self,
        meta: &'static tracing_core::Metadata<'static>,
    ) -> tracing_core::Interest {
        let dropped_counter = match (meta.name(), meta.target()) {
            ("ipc.request", _)
            | ("ipc.request.deserialize_arg", _)
            | ("ipc.request.serialize_returns", _)
            | ("ipc.request.handler", _) => {
                self.ipc_callsites.insert(meta);
                &self.shared.dropped_ipc_events
            }
            _ => &self.shared.dropped_log_events,
        };

        self.send_event(dropped_counter, || Event::Metadata(meta));

        tracing_core::Interest::always()
    }

    fn on_new_span(
        &self,
        attrs: &tracing_core::span::Attributes<'_>,
        id: &tracing_core::span::Id,
        ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let meta = attrs.metadata();
        if self.is_ipc_request(meta) {
            let at = Instant::now();

            let mut ipc_visitor = IPCVisitor::new(meta.into());
            attrs.record(&mut ipc_visitor);

            if let Some(result) = ipc_visitor.result() {
                let stats = Arc::new(stats::IPCRequestStats::new(
                    self.max_poll_duration_nanos,
                    self.max_scheduled_duration_nanos,
                    at,
                ));

                self.send_event(&self.shared.dropped_ipc_events, || {
                    Event::IPCRequestInitiated {
                        id: id.clone(),
                        stats: stats.clone(),
                        metadata: meta,
                        fields: result.fields,
                        handler: api::Location {
                            file: meta.file().map(ToString::to_string),
                            module_path: meta.module_path().map(ToString::to_string),
                            line: result.line.or(meta.line()),
                            column: result.column,
                        },
                        cmd: result.cmd,
                        kind: result.kind,
                    }
                });

                ctx.span(id).unwrap().extensions_mut().insert(stats);
            }
        }

        if matches!(meta.name(), "ipc.request.deserialize_arg" | "ipc.request.serialize_returns" | "ipc.request.handler") {
            if let Some(span) = ctx.span(id) {
                if let Some(parent) = span.parent() {
                    let mut cexts = span.extensions_mut();
                    let pexts = parent.extensions();
                    let stats = pexts.get::<Arc<stats::IPCRequestStats>>().unwrap();
                    cexts.insert(stats.clone());
                }
            }
        }
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
        event: &tracing_core::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let metadata = event.metadata();

        let mut field_visitor = FieldVisitor::new(metadata.into());
        event.record(&mut field_visitor);
        let fields = field_visitor.result();

        self.send_event(&self.shared.dropped_log_events, || {
            Event::Metadata(metadata)
        });

        self.send_event(&self.shared.dropped_log_events, || Event::LogEvent {
            at: Instant::now(),
            metadata: event.metadata(),
            fields,
        })
    }

    fn on_enter(
        &self,
        id: &tracing_core::span::Id,
        ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        if let Some(span) = ctx.span(id) {
            let exts = span.extensions();

            if let Some(stats) = exts.get::<Arc<stats::IPCRequestStats>>() {
                let now = Instant::now();

                match span.name() {
                    "ipc.request.deserialize_arg" => stats.start_deserialize(now),
                    "ipc.request.serialize_returns" => stats.start_serialize(now),
                    "ipc.request.handler" => stats.start_inner(now),
                    _ => {}
                }
            }
        }
    }

    fn on_exit(&self, id: &tracing_core::span::Id, ctx: tracing_subscriber::layer::Context<'_, S>) {
        if let Some(span) = ctx.span(id) {
            let exts = span.extensions();

            if let Some(stats) = exts.get::<Arc<stats::IPCRequestStats>>() {
                let now = Instant::now();
                match span.name() {
                    "ipc.request.deserialize_arg" => stats.end_deserialize(now),
                    "ipc.request.serialize_returns" => stats.end_serialize(now),
                    "ipc.request.handler" => stats.end_inner(now),
                    _ => {}
                }
            }
        }
    }

    fn on_close(&self, id: tracing_core::span::Id, ctx: tracing_subscriber::layer::Context<'_, S>) {
        if let Some(span) = ctx.span(&id) {
            let now = Instant::now();
            let exts = span.extensions();
            if let Some(stats) = exts.get::<Arc<stats::IPCRequestStats>>() {
                stats.complete(now);
            }
        }
    }

    fn on_id_change(
        &self,
        _old: &tracing_core::span::Id,
        _new: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
    }
}
