use crate::config::Config;
use crate::dispatch::Dispatcher;
use crate::visitor::EventVisitor;
use inspector_protocol_primitives::{FieldT, LogManagerT, MetaT, SpanManagerT, SpanStatus, Tree};
use std::fmt;
use std::time::Instant;
use tracing_core::{
	span::{Attributes, Id},
	Field, Subscriber,
};
use tracing_subscriber::{
	layer::{self},
	registry::LookupSpan,
};

const NOT_IN_CONTEXT: &str = "Span not in context, probably a bug";
const NOT_IN_EXTENSIONS: &str = "Cannot find `ActiveSpan`, probably a bug";

/// Represents a span that has been opened and is currently active.
///
/// Contains details about the span, the time it started, and the time it was last entered.
pub(crate) struct ActiveSpan<C>
where
	C: Config,
{
	span: C::Span,
	start: Instant,
	enter: Instant,
}

impl<C> ActiveSpan<C>
where
	C: Config,
{
	/// Create a new opened span based on given attributes and context.
	fn new<S>(id: &Id, maybe_parent: Option<u64>, attrs: &Attributes, _ctx: &layer::Context<S>) -> Self
	where
		S: Subscriber + for<'a> LookupSpan<'a>,
	{
		let mut fields = Vec::new();
		let meta = attrs.metadata();
		attrs.record(&mut |field: &Field, value: &dyn fmt::Debug| {
			fields.push(<<C as Config>::Metadata as MetaT>::Field::new(
				field.name(),
				value.into(),
			));
		});

		let shared = C::Metadata::new(meta, fields);
		ActiveSpan {
			span: C::Span::new(id.into_u64(), maybe_parent, shared, meta.name()),
			start: Instant::now(),
			enter: Instant::now(),
		}
	}

	fn enter(&mut self) {
		self.enter = Instant::now();
		self.span.set_status(SpanStatus::Entered);
	}

	fn exit(&mut self) {
		self.span.set_status(SpanStatus::Exited {
			total_duration: self.start.elapsed(),
			busy_duration: self.enter.elapsed(),
			idle_duration: self.enter.duration_since(self.start),
		})
	}

	/// Retrieve the [`SpanEntry`].
	fn entry(self) -> C::Span {
		self.span
	}
}

/// Builder for creating a [`Layer`] with a specific [`Dispatcher`].
pub struct LayerBuilder<C>
where
	C: Config,
{
	dispatcher: C::Dispatcher,
}

impl<C> LayerBuilder<C>
where
	C: Config,
{
	/// Create a new [`LayerBuilder`] with the provided [`Dispatcher`].
	pub fn new(dispatcher: C::Dispatcher) -> Self {
		LayerBuilder { dispatcher }
	}

	/// Build a [`Layer`] using the provided [`Dispatcher`].
	pub fn build(self) -> Layer<C> {
		Layer {
			dispatcher: self.dispatcher,
		}
	}
}

/// Represents a layer in the subscriber stack which dispatches events to the
/// provided dispatcher. The dispatcher is used to handle incoming tracing events
/// and spans, and can be used to forward them to various outputs or systems.
#[derive(Debug)]
pub struct Layer<C>
where
	C: Config,
{
	dispatcher: C::Dispatcher,
}

impl<C> Layer<C>
where
	C: Config,
{
	pub fn builder(dispatcher: C::Dispatcher) -> LayerBuilder<C> {
		LayerBuilder::new(dispatcher)
	}
}

impl<C, S> layer::Layer<S> for Layer<C>
where
	C: Config,
	S: Subscriber + for<'a> LookupSpan<'a>,
{
	// Notifies this layer that an event has occurred.
	fn on_event(&self, event: &tracing_core::Event<'_>, ctx: layer::Context<'_, S>) {
		let mut visitor = EventVisitor::<<<C as Config>::Metadata as MetaT>::Field> {
			fields: Vec::new(),
			message: None,
		};
		event.record(&mut visitor);

		let meta = C::Metadata::new(event.metadata(), visitor.fields);
		let span = ctx.event_span(event).as_ref().map(|s| s.id().into_u64());
		let log_entry = C::Log::new(span, meta, visitor.message);

		self.dispatcher.dispatch(Tree::Log(log_entry));
	}

	// Notifies this layer that a new span was constructed with the given `Attributes` and `Id`.
	fn on_new_span(&self, attrs: &Attributes<'_>, id: &Id, ctx: layer::Context<'_, S>) {
		let span = ctx.span(id).expect(NOT_IN_CONTEXT);
		let mut extensions = span.extensions_mut();
		let maybe_parent = span.parent().map(|s| s.id().into_u64());
		extensions.insert(ActiveSpan::<C>::new(id, maybe_parent, attrs, &ctx));
	}

	// Notifies this layer that a span with the given `Id` was entered.
	fn on_enter(&self, id: &Id, ctx: layer::Context<'_, S>) {
		let span = ctx.span(id).expect(NOT_IN_CONTEXT);
		let mut extensions = span.extensions_mut();
		let span_entry = extensions.get_mut::<ActiveSpan<C>>().expect(NOT_IN_EXTENSIONS);

		if span_entry.span.status() == SpanStatus::Created {
			span_entry.enter();
			self.dispatcher.dispatch(Tree::Span(span_entry.span.clone()));
		}
	}

	// Notifies this layer that the span with the given `Id` was exited.
	fn on_exit(&self, id: &Id, ctx: layer::Context<'_, S>) {
		ctx.span(id)
			.expect(NOT_IN_CONTEXT)
			.extensions_mut()
			.get_mut::<ActiveSpan<C>>()
			.expect(NOT_IN_EXTENSIONS)
			.exit();
	}

	// Notifies this layer that the span with the given `Id` has been closed.
	fn on_close(&self, id: Id, ctx: layer::Context<'_, S>) {
		let span_ref = ctx.span(&id).expect(NOT_IN_CONTEXT);

		let span_entry = span_ref
			.extensions_mut()
			.remove::<ActiveSpan<C>>()
			.expect(NOT_IN_EXTENSIONS)
			.entry();

		self.dispatcher.dispatch(Tree::Span(span_entry))
	}
}
