use crate::visitors::{EventVisitor, FieldVisitor};
use crate::{Event, Shared, EVENT_BUFFER_CAPACITY};
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::mpsc;
use tokio::sync::mpsc::error::TrySendError;
use tracing_core::span::{Attributes, Id};
use tracing_core::{Interest, Metadata};
use tracing_subscriber::layer::Context;
use tracing_subscriber::registry::SpanRef;

// TODO replace this with `std::thread::ThreadId::as_u64` once it's stable
static THREAD_COUNTER: AtomicU64 = AtomicU64::new(0);

thread_local! {
    static THREAD_ID: u64 = {
        let mut last = THREAD_COUNTER.load(Ordering::Relaxed);
        loop {
            let id = last.checked_add(1).expect("Thread id overflowed");
            match THREAD_COUNTER.compare_exchange_weak(last, id, Ordering::Relaxed, Ordering::Relaxed) {
                Ok(_) => return id,
                Err(id) => last = id,
            }
        }
    };
}

/// A tracing layer that forwards all events to the aggregator
/// This is intentionally kept as simple as possible to avoid any performance overhead on
/// the application thread. All the heavy lifting is done in the aggregator.
pub struct Layer {
    shared: Arc<Shared>,
    tx: mpsc::Sender<Event>,
}

impl Layer {
    pub fn new(shared: Arc<Shared>, tx: mpsc::Sender<Event>) -> Self {
        Self { shared, tx }
    }

    pub fn send_event(&self, dropped: &AtomicUsize, mk_event: impl FnOnce() -> Event) {
        match self.tx.try_reserve() {
            Ok(permit) => {
                permit.send(mk_event());
            }
            Err(TrySendError::Closed(())) => {
                tracing::error!("Event channel closed!");
            }
            Err(TrySendError::Full(())) => {
                dropped.fetch_add(1, Ordering::Release);
            }
        }

        let capacity = self.tx.capacity();
        if capacity <= EVENT_BUFFER_CAPACITY / 2 {
            self.shared.flush.notify_one();
        }
    }
}

impl<S> tracing_subscriber::layer::Layer<S> for Layer
where
    S: tracing_core::Subscriber + for<'a> tracing_subscriber::registry::LookupSpan<'a>,
{
    fn register_callsite(&self, metadata: &'static Metadata<'static>) -> Interest {
        let dropped = if metadata.is_event() {
            &self.shared.dropped_log_events
        } else {
            &self.shared.dropped_span_events
        };
        self.send_event(dropped, || Event::Metadata(metadata));

        Interest::always()
    }

    fn on_new_span(&self, attrs: &Attributes<'_>, id: &Id, ctx: Context<'_, S>) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_span_events, move || {
            let span = ctx.span(id).expect("Span not in context, probably a bug");
            let metadata = span.metadata();
            let maybe_parent = span.parent().map(|s| s.id());

            let mut visitor = FieldVisitor::new(metadata as *const _ as u64);
            attrs.record(&mut visitor);
            let fields = visitor.result();

            Event::NewSpan {
                at,
                id: id.clone(),
                metadata: span.metadata(),
                fields,
                maybe_parent,
            }
        });
    }

    fn on_event(&self, event: &tracing_core::Event<'_>, ctx: Context<'_, S>) {
        let at = Instant::now();
        let metadata = event.metadata();

        self.send_event(&self.shared.dropped_log_events, || {
            Event::Metadata(metadata)
        });

        self.send_event(&self.shared.dropped_log_events, || {
            let mut visitor = EventVisitor::new(metadata as *const _ as u64);
            event.record(&mut visitor);
            let (message, fields) = visitor.result();

            let maybe_parent = ctx.event_span(event).as_ref().map(SpanRef::id);

            Event::Event {
                at,
                metadata,
                message: message.unwrap_or_default(),
                fields,
                maybe_parent,
            }
        });
    }

    fn on_enter(&self, id: &Id, _ctx: Context<'_, S>) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_span_events, || Event::EnterSpan {
            at,
            thread_id: THREAD_ID.with(|id| *id),
            span_id: id.clone(),
        });
    }

    fn on_exit(&self, id: &Id, _ctx: Context<'_, S>) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_span_events, || Event::ExitSpan {
            at,
            thread_id: THREAD_ID.with(|id| *id),
            span_id: id.clone(),
        });
    }

    fn on_close(&self, id: Id, _ctx: Context<'_, S>) {
        let at = Instant::now();

        self.send_event(&self.shared.dropped_span_events, || Event::CloseSpan {
            at,
            span_id: id.clone(),
        });
    }
}

// TODO reenable tests. These are currently broken bc apparently `tracing` leaks events cross-thread
// even when we explicitly set a subscriber only for the current test. Don't ask me why.
#[cfg(test)]
mod test {
    use super::*;
    use futures::StreamExt;
    use tokio::sync::mpsc;
    use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
    use tracing_subscriber::prelude::*;

    /// Asserts that a value matches a given pattern, bringing all name bindings from the pattern into scope
    macro_rules! assert_matches {
        ($value:expr, $pattern:pat, $msg:expr) => {
            let $pattern = $value else { panic!($msg) };
        };
    }

    #[tokio::test]
    #[ignore = "Currently broken, apparently tracing leaks events cross-thread"]
    async fn log_event() {
        let (evt_tx, evt_rx) = mpsc::channel(10);
        let layer = Layer::new(Default::default(), evt_tx);
        let subscriber = tracing_subscriber::registry().with(layer);

        tracing::subscriber::with_default(subscriber, || {
            tracing::debug!("a debug event");
        });

        let events: Vec<_> = ReceiverStream::new(evt_rx).collect().await;
        assert_eq!(events.len(), 2, "{events:#?}");

        assert_matches!(
            events[0],
            Event::Metadata(metadata),
            "expected metadata event"
        );
        assert_eq!(*metadata.level(), tracing_core::Level::DEBUG);

        assert_matches!(
            &events[1],
            Event::Event {
                metadata,
                maybe_parent,
                fields,
                message,
                ..
            },
            "expected log event"
        );
        assert_eq!(metadata, metadata);
        assert!(maybe_parent.is_none());
        assert!(fields.is_empty());
        assert_eq!(message, "a debug event");
    }

    #[tokio::test]
    #[ignore = "Currently broken, apparently tracing leaks events cross-thread"]
    async fn span() {
        let (evt_tx, evt_rx) = mpsc::channel(10);
        let layer = Layer::new(Default::default(), evt_tx);
        let subscriber = tracing_subscriber::registry().with(layer);

        tracing::subscriber::with_default(subscriber, || {
            let _enter = tracing::debug_span!("a span").entered();
            drop(_enter);
        });

        let events: Vec<_> = ReceiverStream::new(evt_rx).collect().await;
        assert_eq!(events.len(), 5, "{events:#?}");

        assert_matches!(
            events[0],
            Event::Metadata(metadata),
            "expected metadata event"
        );
        assert_eq!(*metadata.level(), tracing_core::Level::DEBUG);

        assert_matches!(
            &events[1],
            Event::NewSpan {
                metadata,
                maybe_parent,
                fields,
                id: new_span_id,
                ..
            },
            "expected new span event"
        );
        assert_eq!(metadata, metadata);
        assert!(maybe_parent.is_none());
        assert!(fields.is_empty());

        assert_matches!(
            &events[2],
            Event::EnterSpan {
                span_id: enter_span_id,
                ..
            },
            "expected enter span event"
        );
        assert_eq!(enter_span_id, new_span_id);

        assert_matches!(
            &events[3],
            Event::ExitSpan {
                span_id: exit_span_id,
                ..
            },
            "expected exit span event"
        );
        assert_eq!(exit_span_id, new_span_id);

        assert_matches!(
            &events[4],
            Event::CloseSpan {
                span_id: close_span_id,
                ..
            },
            "expected close span event"
        );
        assert_eq!(close_span_id, new_span_id);
    }
}
