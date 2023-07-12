use crate::{
    callsites::Callsites,
    stats,
    visitors::{FieldVisitor, IPCVisitor},
    Event, Shared,
};
use std::{
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::Instant,
};
use tokio::sync::mpsc;
use tracing_core::Subscriber;
use tracing_subscriber::registry::LookupSpan;

pub(crate) struct Layer {
    shared: Arc<Shared>,
    events: mpsc::Sender<Event>,

    /// When the channel capacity goes under this number, a flush in the aggregator
    /// will be triggered.
    flush_threshold: usize,

    /// Set of callsites for spans representing ongoing IPC requests
    ///
    /// Currently spans are emitted from within the `tauri` crate but also from within user code (through macros)
    /// so this number needs to be quite large (there are as many callsites are there are commands)
    /// TODO make this smaller once all callsites are contained in the tauri crate
    ipc_callsites: Callsites<32>,
}

impl Layer {
    pub fn new(shared: Arc<Shared>, events: mpsc::Sender<Event>, flush_threshold: usize) -> Self {
        Self {
            shared,
            events,
            flush_threshold,
            ipc_callsites: Callsites::default(),
        }
    }

    fn send_event(&self, dropped: &AtomicUsize, mk_event: impl FnOnce() -> Event) {
        use mpsc::error::TrySendError;

        // Return whether or not we actually sent the event.
        match self.events.try_reserve() {
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

        let capacity = self.events.capacity();
        if capacity <= self.flush_threshold {
            self.shared.flush.trigger();
        }
    }

    fn is_ipc_request(&self, meta: &'static tracing_core::Metadata<'static>) -> bool {
        self.ipc_callsites.contains(meta)
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
            _ => &self.shared.dropped_misc_events,
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
                let stats = Arc::new(stats::IPCRequestStats::new(at));

                self.send_event(&self.shared.dropped_ipc_events, || {
                    Event::IPCRequestInitiated {
                        id: id.clone(),
                        cmd: result.cmd,
                        kind: result.kind,
                        stats: stats.clone(),
                        metadata: meta,
                        fields: result.fields,
                        handler: wire::Location {
                            file: meta.file().map(ToString::to_string),
                            module_path: meta.module_path().map(ToString::to_string),
                            line: result.line.or(meta.line()),
                            column: result.column,
                        },
                    }
                });

                ctx.span(id).unwrap().extensions_mut().insert(stats);
            }
        }

        // if we're in a span that belongs to an ipc request,
        // we want to retrieve a reference to the parents stats so we can track the stats on child spans too
        if matches!(
            meta.name(),
            "ipc.request.deserialize_arg" | "ipc.request.serialize_returns" | "ipc.request.handler"
        ) {
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

    fn on_event(
        &self,
        event: &tracing_core::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let now = Instant::now();
        let metadata = event.metadata();

        let mut field_visitor = FieldVisitor::new(metadata.into());
        event.record(&mut field_visitor);
        let fields = field_visitor.result();

        self.send_event(&self.shared.dropped_log_events, || {
            Event::Metadata(metadata)
        });

        // self.send_event(&self.shared.dropped_log_events, || Event::LogEvent {
        //     at: now,
        //     metadata: event.metadata(),
        //     fields,
        // })
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
}
