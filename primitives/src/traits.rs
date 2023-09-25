use crate::{filter::Filter, SpanStatus};
use serde::Serialize;
use std::fmt::Debug;

/// `FilterT` Trait: Enables Dynamic Filtering of Entries.
///
/// Types that implement `FilterT` can be subjected to filtering based on
/// specific criteria encapsulated by a [`Filter`]. This trait facilitates
/// the dynamic inclusion or exclusion of entries based on configurable
/// subscription parameters. For example, in a tracing or logging scenario,
/// only specific entries of interest might be filtered in or out based on
/// user-defined or system-defined criteria.
pub trait FilterT {
	/// Determines if the current item matches the given filter.
	///
	/// # Parameters
	/// * `filter` - The criteria against which the current item is checked.
	///
	/// # Returns
	/// Returns `true` if the current item satisfies the conditions specified
	/// by the filter, otherwise returns `false`.

	fn match_filter(&self, filter: &Filter) -> bool;
}

/// `MetaT` Trait: Represents an [`EntryT`] Metadata.
///
/// All spans and events have the following metadata:
/// - A name, represented as a static string.
/// - A target, a string that categorizes part of the system where the span
///   or event occurred. The `tracing` macros default to using the module
///   path where the span or event originated as the target, but it may be
///   overridden.
/// - A verbosity level. This determines how verbose a given span or event
///   is, and allows enabling or disabling more verbose diagnostics
///   situationally. See the documentation for the [`Level`] type for details.
/// - The names of the [fields] defined by the span or event.
/// - Whether the metadata corresponds to a span or event.
///
/// In addition, the following optional metadata describing the source code
/// location where the span or event originated _may_ be provided:
/// - The file name
/// - The line number
/// - The module path
pub trait MetaT<'a>: Sized + Clone {
	/// The type given back from the from operation
	type Field: FieldT;
	/// Create new `Self` from meta and fields.
	fn new(meta: &'a tracing::Metadata, fields: Vec<Self::Field>) -> Self;
}

/// `EntryT` Trait: Represents a Trace Entry.
///
/// Types that implement `EntryT` are entries in a trace. These could be
/// spans or events. Each trace entry is also associated with some metadata,
/// represented by the `MetaT` type.
///
/// Implementations should define the `KIND` constant to distinguish between
/// different kinds of trace entries, such as "SPAN" or "EVENT".
pub trait EntryT: FilterT + Serialize + Send + Sync + Clone + 'static {}

/// `FieldValueT` Trait: Represents a Value in a Trace Element.
///
/// Types that implement `FieldValueT` can be used as values in tracing fields.
/// The trait provides conversions from several basic types.
pub trait FieldValueT:
	From<i64>
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

/// `FieldT` Trait: Represents a Key-Value Pair in a Trace Element.
///
/// A tracing field is essentially a key-value pair where the key is a string
/// and the value is a type implementing `FieldValueT`.
pub trait FieldT: Clone + Debug + PartialEq {
	/// The type of the value in this key-value pair.
	type Output: FieldValueT;

	/// Constructs a new `Field` with the provided key and value.
	///
	/// # Parameters
	/// * `key` - The key in the key-value pair.
	/// * `value` - The value associated with the key.
	fn new(key: &'static str, value: Self::Output) -> Self;

	/// Retrieves the key associated with this field.
	///
	/// # Returns
	/// The key as a static string.
	fn key(&self) -> &'static str;

	/// Retrieves the value associated with this field.
	///
	/// # Returns
	/// A reference to the value.
	fn value(&self) -> &Self::Output;
}

/// `LogManagerT` Trait: Handles Log Entries.
///
/// This trait is for types that can manage log entries. It extends `EntryT`
/// and should be able to create a new log entry given a span, metadata, and an
/// optional message.
pub trait LogManagerT<M: MetaT<'static>>: EntryT {
	/// Creates a new log entry.
	///
	/// # Parameters
	/// * `span` - An optional parent span.
	/// * `meta` - Metadata associated with the entry.
	/// * `message` - An optional message string.
	fn new(span: Option<u64>, meta: M, message: Option<String>) -> Self;
}

/// `SpanManagerT` Trait: Handles Span Entries.
///
/// This trait is for types that can manage span entries. It extends `EntryT`
/// and should be able to create a new span entry given an ID, optional parent span, metadata, and name.
pub trait SpanManagerT<M: MetaT<'static>>: EntryT {
	/// Creates a new span entry.
	///
	/// # Parameters
	/// * `id` - The unique ID for this span.
	/// * `parent` - An optional parent span ID.
	/// * `meta` - Metadata associated with the span.
	/// * `name` - The name of the span.
	fn new(id: u64, parent: Option<u64>, meta: M, name: &'static str) -> Self;

	/// Sets the status for this span.
	///
	/// # Parameters
	/// * `status` - The new status for the span.
	fn set_status(&mut self, status: SpanStatus);

	/// Retrieves the current status of this span.
	///
	/// # Returns
	/// The current status of the span.
	fn status(&self) -> SpanStatus;
}
