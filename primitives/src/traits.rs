use crate::SpanStatus;
use serde::Serialize;
use std::fmt::Debug;

pub trait MetaT<'a>: Sized + Clone {
	/// The type given back from the from operation
	type Field: FieldT;

	fn new(meta: &'a tracing::Metadata, fields: Vec<Self::Field>) -> Self;
}

pub trait EntryT: Serialize + Send + Sync + Clone + 'static {}

pub trait FieldValueT:
	Clone
	+ Serialize
	+ From<i64>
	+ From<u64>
	+ From<i128>
	+ From<u128>
	+ From<f64>
	+ From<bool>
	+ Sized
	+ for<'a> From<&'a str>
	+ for<'a> From<&'a dyn std::fmt::Debug>
{
}

pub trait FieldT: Clone + Debug + PartialEq {
	/// The type given back from the operation
	type Output: FieldValueT;

	/// Constructs a new `Field` with the provided key and value.
	fn new(key: &'static str, value: Self::Output) -> Self;

	/// Retrieves the key associated with this field.
	fn key(&self) -> &'static str;

	/// Retrieves the value associated with this field.
	fn value(&self) -> &Self::Output;
}

pub trait LogManagerT<M: MetaT<'static>>: EntryT {
	fn new(span: Option<u64>, meta: M, message: Option<String>) -> Self;
}

pub trait SpanManagerT<M: MetaT<'static>>: EntryT {
	fn new(id: u64, parent: Option<u64>, meta: M, name: &'static str) -> Self;
	fn set_status(&mut self, status: SpanStatus);
	fn status(&self) -> SpanStatus;
}
