use crate::dispatch::Dispatcher;
use event_visitor::EventVisitor;
use inspector_protocol_primitives::{FieldSet, LogEntry, Metadata, SpanEntry, Tree};
use std::fmt;
use std::time::Instant;
use tracing_core::{
	span::{Attributes, Id},
	Field, Subscriber,
};
use tracing_subscriber::{layer, registry::LookupSpan};

mod event_visitor;

const NOT_IN_CONTEXT: &str = "Span not in context, probably a bug";
const NOT_IN_EXTENSIONS: &str = "Cannot find `ActiveSpan`, probably a bug";

/// Represents a span that has been opened and is currently active.
///
/// Contains details about the span, the time it started, and the time it was last entered.
pub(crate) struct ActiveSpan<'a> {
	span: SpanEntry<'a>,
	start: Instant,
	enter: Instant,
}

impl<'a> ActiveSpan<'a> {
	/// Create a new opened span based on given attributes and context.
	fn new<S>(id: &Id, attrs: &Attributes, _ctx: &layer::Context<S>) -> Self
	where
		S: Subscriber + for<'b> LookupSpan<'b>,
	{
		let mut fields = FieldSet::default();
		let meta = attrs.metadata();

		attrs.record(&mut |field: &Field, value: &dyn fmt::Debug| {
			fields.push(inspector_protocol_primitives::Field::new(field.name(), value.into()));
		});

		let shared = Metadata::new(meta, fields);

		ActiveSpan {
			span: SpanEntry::new(id.into_u64(), shared, meta.name()),
			start: Instant::now(),
			enter: Instant::now(),
		}
	}

	fn enter(&mut self) {
		self.enter = Instant::now();
	}

	fn exit(&mut self) {
		self.span.total_duration = self.start.elapsed();
		self.span.idle_duration = self.enter.duration_since(self.start);
		self.span.busy_duration = self.enter.elapsed();
	}

	fn record_span(&mut self, span: SpanEntry<'a>) {
		self.span.nodes.push(Tree::Span(span));
	}

	/// Retrieve the [`SpanEntry`].
	fn entry(self) -> SpanEntry<'a> {
		self.span
	}
}

/// Builder for creating a [`Layer`] with a specific [`Dispatcher`].
pub struct LayerBuilder<T> {
	dispatcher: T,
}

impl<T> LayerBuilder<T>
where
	T: Dispatcher<'static> + 'static,
{
	/// Create a new [`LayerBuilder`] with the provided [`Dispatcher`].
	pub fn new(dispatcher: T) -> Self {
		LayerBuilder { dispatcher }
	}

	/// Build a [`Layer`] using the provided [`Dispatcher`].
	pub fn build(self) -> Layer<T> {
		Layer {
			dispatcher: self.dispatcher,
		}
	}
}

/// Represents a layer in the subscriber stack which dispatches events to the
/// provided dispatcher. The dispatcher is used to handle incoming tracing events
/// and spans, and can be used to forward them to various outputs or systems.
#[derive(Debug)]
pub struct Layer<T: Dispatcher<'static>> {
	dispatcher: T,
}

impl<T> Layer<T>
where
	T: Dispatcher<'static> + 'static,
{
	pub fn builder(dispatcher: T) -> LayerBuilder<T> {
		LayerBuilder::new(dispatcher)
	}
}

impl<S, T: Dispatcher<'static> + 'static> layer::Layer<S> for Layer<T>
where
	S: Subscriber + for<'a> LookupSpan<'a>,
{
	// Notifies this layer that an event has occurred.
	fn on_event(&self, event: &tracing_core::Event<'_>, ctx: layer::Context<'_, S>) {
		let mut visitor = EventVisitor::default();
		event.record(&mut visitor);

		let meta = Metadata::new(event.metadata(), visitor.fields);
		let span = ctx.event_span(event).as_ref().map(|s| s.id().into_u64());
		let log_entry = LogEntry::new(span, meta, visitor.message);

		self.dispatcher.dispatch(log_entry.into());
	}

	// Notifies this layer that a new span was constructed with the given `Attributes` and `Id`.
	fn on_new_span(&self, attrs: &Attributes<'_>, id: &Id, ctx: layer::Context<'_, S>) {
		let span = ctx.span(id).expect("should be in context");
		let mut extensions = span.extensions_mut();
		extensions.insert(ActiveSpan::new(id, attrs, &ctx));
	}

	// Notifies this layer that a span with the given `Id` was entered.
	fn on_enter(&self, id: &Id, ctx: layer::Context<'_, S>) {
		ctx.span(id)
			.expect(NOT_IN_CONTEXT)
			.extensions_mut()
			.get_mut::<ActiveSpan>()
			.expect(NOT_IN_EXTENSIONS)
			.enter();
	}

	// Notifies this layer that the span with the given `Id` was exited.
	fn on_exit(&self, id: &Id, ctx: layer::Context<'_, S>) {
		ctx.span(id)
			.expect(NOT_IN_CONTEXT)
			.extensions_mut()
			.get_mut::<ActiveSpan>()
			.expect(NOT_IN_EXTENSIONS)
			.exit();
	}

	// Notifies this layer that the span with the given `Id` has been closed.
	fn on_close(&self, id: Id, ctx: layer::Context<'_, S>) {
		let span_ref = ctx.span(&id).expect(NOT_IN_CONTEXT);

		let span_entry = span_ref
			.extensions_mut()
			.remove::<ActiveSpan>()
			.expect(NOT_IN_EXTENSIONS)
			.entry();

		match span_ref.parent() {
			// Record the span as a child of the `parent`
			Some(parent) => parent
				.extensions_mut()
				.get_mut::<ActiveSpan>()
				.expect(NOT_IN_EXTENSIONS)
				.record_span(span_entry),
			None => self.dispatcher.dispatch(span_entry.into()),
		}
	}
}
