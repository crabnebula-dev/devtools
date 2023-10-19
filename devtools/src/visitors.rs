use std::fmt::Debug;
use tauri_devtools_wire_format::{Field, MetaId};
use tracing_subscriber::field::Visit;

/// A visitor that collects all fields from tracing events and spans.
pub struct FieldVisitor {
    meta_id: MetaId,
    /// A set of custom fields that provide additional data about the event.
    fields: Vec<Field>,
}

/// A visitor that collects metadata needed to construct a log event from a tracing event.
pub struct EventVisitor {
    field_visitor: FieldVisitor,
    /// The optional message associated with the event.
    message: Option<String>,
}

impl FieldVisitor {
    pub(crate) fn new(meta_id: MetaId) -> Self {
        Self {
            fields: Vec::default(),
            meta_id,
        }
    }
    pub(crate) fn result(self) -> Vec<Field> {
        self.fields
    }
}

impl EventVisitor {
    pub(crate) fn new(meta_id: MetaId) -> Self {
        Self {
            field_visitor: FieldVisitor::new(meta_id),
            message: None,
        }
    }
    pub(crate) fn result(self) -> (String, Vec<Field>) {
        (
            self.message.unwrap(), // TODO handle result here
            self.field_visitor.result(),
        )
    }
}

impl Visit for FieldVisitor {
    fn record_debug(&mut self, field: &tracing_core::Field, value: &dyn Debug) {
        self.fields.push(Field {
            metadata_id: Some(self.meta_id.clone()),
            name: Some(field.name().into()),
            value: Some(value.into()),
        })
    }
}

impl Visit for EventVisitor {
    /// Visit a value that implements `Debug`.
    fn record_debug(&mut self, field: &tracing_core::Field, value: &dyn Debug) {
        match field.name() {
            // skip fields that are `log` metadata that have already been handled
            name if name.starts_with("log.") => (),
            "message" if self.message.is_none() => self.message = Some(format!("{value:?}")),
            _ => self.field_visitor.record_debug(field, value),
        }
    }
}
