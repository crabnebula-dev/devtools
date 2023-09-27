use crate::visitors::EventVisitor;
use std::fmt;
use std::time::Instant;
use tauri_devtools_shared::{Field, FieldSet, LogEntry, Metadata, SpanEntry, SpanStatus, Tree};
use tokio::sync::mpsc;
use tracing_core::Subscriber;
use tracing_subscriber::layer;
use tracing_subscriber::registry::LookupSpan;

const NOT_IN_CONTEXT: &str = "Span not in context, probably a bug";
const NOT_IN_EXTENSIONS: &str = "Cannot find `ActiveSpan`, probably a bug";

pub struct Layer {
	trees_tx: mpsc::UnboundedSender<Tree>,
}

/// Represents a span that has been opened and is currently active.
///
/// Contains details about the span, the time it started, and the time it was last entered.
pub(crate) struct ActiveSpan {
	span: SpanEntry,
	start: Instant,
	enter: Instant,
}

impl Layer {
	pub fn new(trees_tx: mpsc::UnboundedSender<Tree>) -> Self {
		Self { trees_tx }
	}

	pub fn dispatch(&self, tree: Tree) {
		let _ = self.trees_tx.send(tree); // TODO handle error here
	}
}

impl<S> layer::Layer<S> for Layer
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

		self.dispatch(log_entry.into());
	}

	// Notifies this layer that a new span was constructed with the given `Attributes` and `Id`.
	fn on_new_span(
		&self,
		attrs: &tracing_core::span::Attributes<'_>,
		id: &tracing_core::span::Id,
		ctx: layer::Context<'_, S>,
	) {
		let span = ctx.span(id).expect(NOT_IN_CONTEXT);
		let mut extensions = span.extensions_mut();
		let maybe_parent = span.parent().map(|s| s.id().into_u64());
		extensions.insert(ActiveSpan::new(id, maybe_parent, attrs, &ctx));
	}

	// Notifies this layer that a span with the given `Id` was entered.
	fn on_enter(&self, id: &tracing_core::span::Id, ctx: layer::Context<'_, S>) {
		let span = ctx.span(id).expect(NOT_IN_CONTEXT);
		let mut extensions = span.extensions_mut();
		let span_entry = extensions.get_mut::<ActiveSpan>().expect(NOT_IN_EXTENSIONS);

		if span_entry.span.status == SpanStatus::Created {
			span_entry.enter();
			self.dispatch(span_entry.span.clone().into());
		}
	}

	// Notifies this layer that the span with the given `Id` was exited.
	fn on_exit(&self, id: &tracing_core::span::Id, ctx: layer::Context<'_, S>) {
		ctx.span(id)
			.expect(NOT_IN_CONTEXT)
			.extensions_mut()
			.get_mut::<ActiveSpan>()
			.expect(NOT_IN_EXTENSIONS)
			.exit();
	}

	// Notifies this layer that the span with the given `Id` has been closed.
	fn on_close(&self, id: tracing_core::span::Id, ctx: layer::Context<'_, S>) {
		let span_ref = ctx.span(&id).expect(NOT_IN_CONTEXT);

		let span_entry = span_ref
			.extensions_mut()
			.remove::<ActiveSpan>()
			.expect(NOT_IN_EXTENSIONS)
			.entry();

		self.dispatch(span_entry.into())
	}
}

impl ActiveSpan {
	/// Create a new opened span based on given attributes and context.
	fn new<S>(
		id: &tracing_core::span::Id,
		maybe_parent: Option<u64>,
		attrs: &tracing_core::span::Attributes<'_>,
		_ctx: &layer::Context<S>,
	) -> Self
	where
		S: Subscriber + for<'b> LookupSpan<'b>,
	{
		let mut fields = FieldSet::default();
		let meta = attrs.metadata();

		attrs.record(&mut |field: &tracing_core::Field, value: &dyn fmt::Debug| {
			fields.push(Field::new(field.name().to_string(), value.into()));
		});

		let shared = Metadata::new(meta, fields);

		ActiveSpan {
			span: SpanEntry::new(id.into_u64(), maybe_parent, shared, meta.name().to_string()),
			start: Instant::now(),
			enter: Instant::now(),
		}
	}

	fn enter(&mut self) {
		self.enter = Instant::now();
		self.span.status = SpanStatus::Entered;
	}

	fn exit(&mut self) {
		self.span.status = SpanStatus::Exited {
			total_duration: self.start.elapsed(),
			busy_duration: self.enter.elapsed(),
			idle_duration: self.enter.duration_since(self.start),
		}
	}

	/// Retrieve the [`SpanEntry`].
	fn entry(self) -> SpanEntry {
		self.span
	}
}
