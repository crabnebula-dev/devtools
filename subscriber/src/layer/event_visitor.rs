use inspector_protocol_primitives::{Field as InspectorFied, FieldSet};
use std::fmt;
use tracing_core::Field;

/// Represents an event visitor that collects information about tracing events.
#[derive(Default)]
pub(crate) struct EventVisitor {
	/// The optional message associated with the event.
	pub(crate) message: Option<String>,
	/// A set of custom fields that provide additional data about the event.
	pub(crate) fields: FieldSet,
}

impl tracing_subscriber::field::Visit for EventVisitor {
	/// Visit a string value.
	fn record_str(&mut self, field: &Field, value: &str) {
		match field.name() {
			// skip fields that are `log` metadata that have already been handled
			name if name.starts_with("log.") => (),
			"message" if self.message.is_none() => self.message = Some(format!("{value:?}")),
			key => self.fields.push(InspectorFied::new(key, value.into())),
		}
	}

	/// Visit a value that implements `Debug`.
	fn record_debug(&mut self, field: &Field, value: &dyn fmt::Debug) {
		match field.name() {
			// skip fields that are `log` metadata that have already been handled
			name if name.starts_with("log.") => (),
			"message" if self.message.is_none() => self.message = Some(format!("{value:?}")),
			key => self.fields.push(InspectorFied::new(key, value.into())),
		}
	}

	/// Visit a double-precision floating point value.
	fn record_f64(&mut self, field: &Field, value: f64) {
		self.fields.push(InspectorFied::new(field.name(), value.into()))
	}

	/// Visit a signed 64-bit integer value.
	fn record_i64(&mut self, field: &Field, value: i64) {
		self.fields.push(InspectorFied::new(field.name(), value.into()))
	}

	/// Visit an unsigned 64-bit integer value.
	fn record_u64(&mut self, field: &Field, value: u64) {
		self.fields.push(InspectorFied::new(field.name(), value.into()))
	}

	/// Visit a signed 128-bit integer value.
	fn record_i128(&mut self, field: &Field, value: i128) {
		self.fields.push(InspectorFied::new(field.name(), value.into()))
	}

	/// Visit an unsigned 128-bit integer value.
	fn record_u128(&mut self, field: &Field, value: u128) {
		self.fields.push(InspectorFied::new(field.name(), value.into()))
	}

	/// Visit a boolean value.
	fn record_bool(&mut self, field: &Field, value: bool) {
		self.record_debug(field, &value)
	}
}
