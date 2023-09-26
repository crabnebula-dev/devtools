use tauri_devtools_shared::{Field as InspectorField, FieldSet};
use std::fmt;
use tracing_core::Field;
use tracing_subscriber::field::Visit;

/// Represents an event visitor that collects information about tracing events.
#[derive(Default)]
pub(crate) struct EventVisitor {
    /// The optional message associated with the event.
    pub(crate) message: Option<String>,
    /// A set of custom fields that provide additional data about the event.
    pub(crate) fields: FieldSet,
}

impl Visit for EventVisitor {
    /// Visit a value that implements `Debug`.
    fn record_debug(&mut self, field: &Field, value: &dyn fmt::Debug) {
        match field.name() {
            // skip fields that are `log` metadata that have already been handled
            name if name.starts_with("log.") => (),
            "message" if self.message.is_none() => self.message = Some(format!("{value:?}")),
            key => self.fields.push(InspectorField::new(key, value.into())),
        }
    }
}
