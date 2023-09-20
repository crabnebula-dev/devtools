pub use asset::{Asset, AssetParams};
pub use field::{Field, FieldSet};
pub use filter::{Filter, Filterable};
pub use inspector::{Inspector, InspectorBuilder, InspectorChannels, InspectorMetrics};
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
pub use tauri::{AppHandle, Manager, Runtime};
pub use tracing::Level;

mod asset;
mod field;
mod filter;
mod inspector;
mod ser;

/// Panic if the given expression does not evaluate to `Ok`.
///
/// # Examples
/// ```no_test
/// assert_ok!(some_result);
/// assert_ok!(some_result, expected_ok_value);
/// ```
#[macro_export]
macro_rules! assert_ok {
	( $x:expr $(,)? ) => {
		match $x {
			Ok(_) => (),
			_ => assert!(false, "Expected Ok(_). Got {:#?}", $x),
		}
	};
	( $x:expr, $y:expr $(,)? ) => {
		assert_eq!($x, Ok($y));
	};
}

/// Enum representing a [LogEntry] or a [SpanEntry]
#[derive(Debug, Serialize, Clone)]
pub enum Tree<'a> {
	Log(LogEntry<'a>),
	Span(SpanEntry<'a>),
}

/// Holds metadata for logs and spans entry.
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Metadata<'a> {
	/// The timestamp of the entry, represented as a unix timestamp in milliseconds.
	pub timestamp: u128,
	/// The entry level (e.g., INFO, ERROR).
	#[serde(serialize_with = "ser::to_string")]
	pub level: &'a Level,
	/// The target of the entry directive.
	pub target: &'a str,
	/// The path to the module where the entry was produced
	pub module_path: Option<&'a str>,
	/// The source file that produced the entry
	pub file: Option<&'a str>,
	/// The line number in the source file where the entry was produced
	pub line: Option<u32>,
	/// Additional key-value data associated with the entry.
	#[serde(serialize_with = "ser::fieldset")]
	pub fields: FieldSet,
}

impl<'a> Metadata<'a> {
	pub fn new(meta: &'a tracing::Metadata<'a>, fields: Vec<Field>) -> Self {
		Self {
			timestamp: now(),
			level: meta.level(),
			target: meta.target(),
			module_path: meta.module_path(),
			file: meta.file(),
			line: meta.line(),
			fields,
		}
	}
}

/// A single log entry captured from the `tracing` crate.
#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry<'a> {
	/// Span linked with this log entry.
	pub span: Option<u64>,

	/// Shared fields between events and spans.
	#[serde(flatten)]
	pub meta: Metadata<'a>,

	/// The main content of the log
	pub message: Option<String>,
}

impl<'a> LogEntry<'a> {
	pub fn new(span: Option<u64>, meta: Metadata<'a>, message: Option<String>) -> Self {
		Self { span, meta, message }
	}
}

impl<'a> From<LogEntry<'a>> for Tree<'a> {
	fn from(val: LogEntry<'a>) -> Self {
		Tree::Log(val)
	}
}

/// Implementation of the [`Filterable`] trait for the `LogEntry` struct.
///
/// This implementation provides the logic to determine whether a `LogEntry`
/// matches a given filter.
impl<'a> Filterable for LogEntry<'a> {
	fn match_filter(&self, filter: &filter::Filter) -> bool {
		match filter {
			filter::Filter::Level { level } => self.meta.level == level,
			filter::Filter::Text { text } => {
				self.meta.target.contains(text) || self.message.as_ref().is_some_and(|m| m.contains(text))
			}
		}
	}
}

/// A span captured from the `tracing` crate.
///
/// A span represents a period of time or a unit of work in the application.
#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SpanEntry<'a> {
	/// Span unique id
	pub id: u64,
	/// Span metadata
	#[serde(flatten)]
	pub meta: Metadata<'a>,
	/// Span name
	pub name: &'a str,
	/// Span status
	pub status: SpanStatus,
	/// Parent span
	pub parent: Option<u64>,
}

/// Implementation of the [`Filterable`] trait for the `SpanEntry` struct.
///
/// This implementation provides the logic to determine whether a `SpanEntry`
/// matches a given filter.
impl<'a> Filterable for SpanEntry<'a> {
	fn match_filter(&self, filter: &filter::Filter) -> bool {
		match filter {
			filter::Filter::Level { level } => self.meta.level == level,
			filter::Filter::Text { text } =>
			// Check if the target or the span name contains the text.
			{
				self.meta.target.contains(text) || self.name.contains(text)
			}
		}
	}
}

/// A span status.
///
/// Serialization example;
/// {
///   "value": "EXITED",
///   "attrs":{
///      "totalDuration": {"secs":0,"nanos":241806},
///      "busyDuration": {"secs":0,"nanos":168110},
///      "idleDuration":{"secs":0,"nanos":73911}
///   }
/// }
#[derive(Debug, Serialize, Clone, PartialEq)]
#[serde(tag = "value", content = "attrs", rename_all = "UPPERCASE")]
pub enum SpanStatus {
	/// Created event is NOT dispatched
	#[serde(skip_serializing)]
	Created,
	/// Span has been entered
	Entered,
	#[serde(rename_all = "camelCase")]
	/// Span has been exited
	Exited {
		/// The total time of the span
		total_duration: Duration,
		/// The total time for which it was entered
		busy_duration: Duration,
		/// The total time that the span existed but was not entered
		idle_duration: Duration,
	},
}

impl<'a> From<SpanEntry<'a>> for Tree<'a> {
	fn from(val: SpanEntry<'a>) -> Self {
		Tree::Span(val)
	}
}

impl<'a> SpanEntry<'a> {
	pub fn new(id: u64, parent: Option<u64>, meta: Metadata<'a>, name: &'static str) -> Self {
		Self {
			id,
			meta,
			name,
			status: SpanStatus::Created,
			parent,
		}
	}
}

/// Parameters required for establishing a websocket subscription.
///
/// This struct encapsulates the criteria needed to filter and control the flow
/// of data over a websocket connection. By providing a filter, clients can
/// selectively receive data that matches the specified criteria.
#[derive(Debug, Deserialize)]
pub struct SubscriptionParams {
	/// The filter used to determine which entries
	/// should be delivered over the websocket.
	pub filter: Filter,
}

/// Current system time (unix timestamp in ms)
pub fn now() -> u128 {
	SystemTime::now()
		.duration_since(UNIX_EPOCH)
		.unwrap_or_default()
		.as_millis()
}
