use crate::visitors::{EventVisitor, FieldVisitor};
use crate::Event;
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

		self.dispatch(Event::NewSpan {
			at,
			id: id.clone(),
			metadata: span.metadata(),
			fields,
			maybe_parent,
		});
	}

	// Notifies this layer that an event has occurred.
	fn on_event(&self, event: &tracing_core::Event<'_>, ctx: layer::Context<'_, S>) {
		let at = Instant::now();
		let metadata = event.metadata();

		self.dispatch(Event::Metadata(metadata));

		let mut visitor = EventVisitor::new(metadata.into());
		event.record(&mut visitor);
		let (message, fields) = visitor.result();

		let maybe_parent = ctx.event_span(event).as_ref().map(|s| s.id());

		self.dispatch(Event::LogEvent {
			at,
			metadata,
			message,
			fields,
			maybe_parent,
		});
	}

	// Notifies this layer that a span with the given `Id` was entered.
	fn on_enter(&self, id: &tracing_core::span::Id, _: layer::Context<'_, S>) {
		let at = Instant::now();

		self.dispatch(Event::EnterSpan {
			at,
			thread_id: 0,
			span_id: id.clone(),
		});
	}

	// Notifies this layer that the span with the given `Id` was exited.
	fn on_exit(&self, id: &tracing_core::span::Id, _: layer::Context<'_, S>) {
		let at = Instant::now();

		self.dispatch(Event::ExitSpan {
			at,
			thread_id: 0,
			span_id: id.clone(),
		});
	}

	// Notifies this layer that the span with the given `Id` has been closed.
	fn on_close(&self, id: tracing_core::span::Id, _: layer::Context<'_, S>) {
		let at = Instant::now();

		self.dispatch(Event::CloseSpan {
			at,
			span_id: id.clone(),
		});
	}
}
