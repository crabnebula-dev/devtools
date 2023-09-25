use crate::{FieldT, FieldValueT};
use serde::Serialize;

/// A collection of fields used for tracing.
pub type FieldSet = Vec<Field>;

/// Represents a key-value pair used for tracing data.
///
/// Fields are essentially metadata associated with some event, span or log
/// in a tracing context. They provide context about the event, for example:
/// its severity, location, execution time, etc.
#[derive(Clone, Debug, PartialEq)]
pub struct Field {
	key: &'static str,
	value: FieldValue,
}

/// Different types of values a tracing field can have.
///
/// This enum encapsulates various types of data that might be associated
/// with a tracing event, from simple types like `bool` and `String`, to
/// integers and even debug representations.
#[derive(PartialEq, Debug, Clone, Serialize)]
#[serde(untagged)]
pub enum FieldValue {
	Bool(bool),
	Str(String),
	F64(f64),
	U64(u64),
	I64(i64),
	U128(u128),
	I128(i128),
	Debug(String),
}
impl FieldValueT for FieldValue {}

impl FieldT for Field {
	type Output = FieldValue;
	/// Constructs a new `Field` with the provided key and value.
	fn new(key: &'static str, value: Self::Output) -> Self {
		Field { key, value }
	}

	/// Retrieves the key associated with this field.
	fn key(&self) -> &'static str {
		self.key
	}

	/// Retrieves the value associated with this field.
	fn value(&self) -> &Self::Output {
		&self.value
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

impl From<i128> for FieldValue {
	fn from(val: i128) -> Self {
		FieldValue::I128(val)
	}
}

impl From<u128> for FieldValue {
	fn from(val: u128) -> Self {
		FieldValue::U128(val)
	}
}

impl From<f64> for FieldValue {
	fn from(val: f64) -> Self {
		FieldValue::F64(val)
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
		// FIXME: `debug` include a double quote "\"
		FieldValue::Debug(format!("{val:?}"))
	}
}
