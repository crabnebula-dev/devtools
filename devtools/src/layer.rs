use crate::visitors::{EventVisitor, FieldVisitor};
use crate::{CloseSpan, EnterSpan, Event, ExitSpan, LogEvent, NewSpan};
use std::time::Instant;
use tokio::sync::mpsc;
use tracing_core::{Interest, Metadata, Subscriber};
use tracing_subscriber::layer;
use tracing_subscriber::registry::LookupSpan;

pub(crate) struct Layer {
	tx: mpsc::Sender<Event>,
}

impl Layer {
	pub fn new(tx: mpsc::Sender<Event>) -> Self {
		Self { tx }
	}

	pub fn dispatch(&self, event: Event) {
		let _ = self.tx.try_send(event); // TODO handle error here
	}
}

impl<S> layer::Layer<S> for Layer
where
	S: Subscriber + for<'a> LookupSpan<'a>,
{
	fn register_callsite(&self, meta: &'static Metadata<'static>) -> Interest {
		self.dispatch(Event::Metadata(meta));

		Interest::always()
	}
	// Notifies this layer that a new span was constructed with the given `Attributes` and `Id`.
	fn on_new_span(
		&self,
		attrs: &tracing_core::span::Attributes<'_>,
		id: &tracing_core::span::Id,
		ctx: layer::Context<'_, S>,
	) {
		let at = Instant::now();
		let span = ctx.span(id).expect("Span not in context, probably a bug");
		let metadata = span.metadata();
		let maybe_parent = span.parent().map(|s| s.id());

		let mut visitor = FieldVisitor::new(metadata.into());
		attrs.record(&mut visitor);
		let fields = visitor.result();

		self.dispatch(Event::NewSpan(NewSpan {
			at,
			id: id.clone(),
			metadata: span.metadata(),
			fields,
			maybe_parent,
		}));
	}

	// Notifies this layer that an event has occurred.
	fn on_event(&self, event: &tracing_core::Event<'_>, ctx: layer::Context<'_, S>) {
		let at = Instant::now();
		let metadata = event.metadata();

		let mut visitor = EventVisitor::new(metadata.into());
		event.record(&mut visitor);
		let (message, fields) = visitor.result();

		let maybe_parent = ctx.event_span(event).as_ref().map(|s| s.id());

		self.dispatch(Event::LogEvent(LogEvent {
			at,
			metadata,
			message,
			fields,
			maybe_parent,
		}));
	}

	// Notifies this layer that a span with the given `Id` was entered.
	fn on_enter(&self, id: &tracing_core::span::Id, _: layer::Context<'_, S>) {
		let at = Instant::now();

		self.dispatch(Event::EnterSpan(EnterSpan {
			at,
			thread_id: 0,
			span_id: id.clone(),
		}));
	}

	// Notifies this layer that the span with the given `Id` was exited.
	fn on_exit(&self, id: &tracing_core::span::Id, _: layer::Context<'_, S>) {
		let at = Instant::now();

		self.dispatch(Event::ExitSpan(ExitSpan {
			at,
			thread_id: 0,
			span_id: id.clone(),
		}));
	}

	// Notifies this layer that the span with the given `Id` has been closed.
	fn on_close(&self, id: tracing_core::span::Id, _: layer::Context<'_, S>) {
		let at = Instant::now();

		self.dispatch(Event::CloseSpan(CloseSpan {
			at,
			span_id: id.clone(),
		}));
	}
}

#[cfg(test)]
mod test {
	use super::*;
	use futures::StreamExt;
	use tokio::sync::mpsc;
	use tokio_stream::wrappers::ReceiverStream;
	use tracing_subscriber::prelude::*;

	/// Asserts that a value matches a given pattern, bringing all name bindings from the pattern into scope
	macro_rules! assert_matches {
		($value:expr, $pattern:pat, $msg:expr) => {
			let $pattern = $value else { panic!($msg) };
		};
	}

	#[tokio::test]
	async fn log_event() {
		let (evt_tx, evt_rx) = mpsc::channel(10);
		let layer = Layer::new(evt_tx);
		let subscriber = tracing_subscriber::registry().with(layer);

		tracing::subscriber::with_default(subscriber, || {
			tracing::debug!("a debug event");
		});

		let events: Vec<_> = ReceiverStream::new(evt_rx).collect().await;
		assert_eq!(events.len(), 2, "{events:#?}");

		assert_matches!(events[0], Event::Metadata(metadata), "expected metadata event");
		assert_eq!(*metadata.level(), tracing_core::Level::DEBUG);

		assert_matches!(&events[1], Event::LogEvent(log_event), "expected log event");
		assert_eq!(metadata, log_event.metadata);
		assert!(log_event.maybe_parent.is_none());
		assert!(log_event.fields.is_empty());
	}

	#[tokio::test]
	async fn span() {
		let (evt_tx, evt_rx) = mpsc::channel(10);
		let layer = Layer::new(evt_tx);
		let subscriber = tracing_subscriber::registry().with(layer);

		tracing::subscriber::with_default(subscriber, || {
			let _enter = tracing::debug_span!("a span").entered();
			drop(_enter);
		});

		let events: Vec<_> = ReceiverStream::new(evt_rx).collect().await;
		assert_eq!(events.len(), 5, "{events:#?}");

		assert_matches!(events[0], Event::Metadata(metadata), "expected metadata event");
		assert_eq!(*metadata.level(), tracing_core::Level::DEBUG);

		assert_matches!(&events[1], Event::NewSpan(new_span), "expected new span event");
		assert_eq!(metadata, new_span.metadata);
		assert!(new_span.maybe_parent.is_none());
		assert!(new_span.fields.is_empty());

		assert_matches!(&events[2], Event::EnterSpan(enter_span), "expected enter span event");
		assert_eq!(enter_span.span_id, new_span.id);

		assert_matches!(&events[3], Event::ExitSpan(exit_span), "expected exit span event");
		assert_eq!(exit_span.span_id, new_span.id);

		assert_matches!(&events[4], Event::CloseSpan(close_span), "expected close span event");
		assert_eq!(close_span.span_id, new_span.id);
	}
}
