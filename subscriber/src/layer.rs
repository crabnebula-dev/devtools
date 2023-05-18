use std::{
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
    time::Instant,
};

use tokio::sync::mpsc;

use crate::{util::TimeAnchor, visitors::FieldVisitor, Event, Shared};

pub struct Layer {
    tx: mpsc::Sender<Event>,

    shared: Arc<Shared>,

    /// When the channel capacity goes under this number, a flush in the aggregator
    /// will be triggered.
    flush_threshold: usize,

    /// Used to anchor monotonic timestamps to a base `SystemTime`, to produce a
    /// timestamp that can be sent over the wire.
    base_time: TimeAnchor,
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

    pub(crate) fn new(shared: Arc<Shared>, tx: mpsc::Sender<Event>) -> Self {
        Self {
            shared,
            tx,
            flush_threshold: Self::DEFAULT_EVENT_BUFFER_CAPACITY / 2,
            base_time: TimeAnchor::new(),
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
        meta: &'static tracing_core::Metadata<'static>,
    ) -> tracing_core::Interest {
        self.send_event(&self.shared.dropped_log_events, || Event::Metadata(meta));

        tracing_core::Interest::always()
    }

    fn on_new_span(
        &self,
        attrs: &tracing_core::span::Attributes<'_>,
        id: &tracing_core::span::Id,
        ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let _ = (attrs, id, ctx);
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

        self.send_event(&self.shared.dropped_log_events, || Event::LogEvent {
            at: Instant::now(),
            metadata: event.metadata(),
            fields,
        })
    }

    fn on_enter(
        &self,
        _id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
    }

    fn on_exit(
        &self,
        _id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
    }

    fn on_close(
        &self,
        _id: tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
    }

    fn on_id_change(
        &self,
        _old: &tracing_core::span::Id,
        _new: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
    }
}
