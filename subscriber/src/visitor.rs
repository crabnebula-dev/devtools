use tracing_core::field::Visit;

#[derive(Debug, Clone)]
pub struct Field {
	pub name: String,
	pub value: FieldValue,
}

#[derive(PartialEq, Debug, Clone)]
pub enum FieldValue {
	Bool(bool),
	Str(String),
	U64(u64),
	I64(i64),
	Debug(String),
}

#[derive(Default)]
pub struct FieldVisitor {
	fields: Vec<Field>,
}

impl FieldVisitor {
	pub(crate) fn result(self) -> Vec<Field> {
		self.fields
	}
}

impl Visit for FieldVisitor {
	fn record_debug(&mut self, field: &tracing_core::Field, value: &dyn std::fmt::Debug) {
		self.fields.push(Field {
			name: field.name().into(),
			value: value.into(),
		})
	}
}

impl From<i64> for FieldValue {
	fn from(val: i64) -> Self {
		FieldValue::I64(val)
	}
}

impl From<u64> for FieldValue {
	fn from(val: u64) -> Self {
		FieldValue::U64(val)
	}
}

impl From<bool> for FieldValue {
	fn from(val: bool) -> Self {
		FieldValue::Bool(val)
	}
}

impl From<&str> for FieldValue {
	fn from(val: &str) -> Self {
		FieldValue::Str(val.into())
	}
}

impl From<&dyn std::fmt::Debug> for FieldValue {
	fn from(val: &dyn std::fmt::Debug) -> Self {
		FieldValue::Debug(format!("{:?}", val))
	}
}
