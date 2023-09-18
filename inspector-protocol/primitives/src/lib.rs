pub use asset::{Asset, AssetParams};
pub use field::{Field, FieldSet};
use serde::Serialize;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
pub use tauri::{AppHandle, Manager, Runtime};
pub use tauri_config::Config as TauriConfig;
pub use tracing::Level;
pub use typescript_type_def::TypeDef;

mod asset;
mod field;
pub mod schema;
mod ser;
mod tauri_config;

pub type TypeScriptDef<'meta> = (
	AppMetrics,
	Asset,
	AssetParams,
	Metadata<'meta>,
	SpanEntry<'meta>,
	LogEntry<'meta>,
	TauriConfig,
);

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
#[derive(Clone, Debug, Serialize, TypeDef)]
#[serde(rename_all = "camelCase")]
pub struct Metadata<'a> {
	/// The timestamp of the entry, represented as a unix timestamp in milliseconds.
	#[type_def(type_of = "String")]
	pub timestamp: u128,

	/// The entry level (e.g., INFO, ERROR).
	#[type_def(type_of = "String")]
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
	#[type_def(type_of = "serde_json::Value")]
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
#[derive(Debug, Serialize, Clone, TypeDef)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry<'a> {
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

/// A span captured from the `tracing` crate.
///
/// A span represents a period of time or a unit of work in the application.
#[derive(Debug, Serialize, Clone, TypeDef)]
#[serde(rename_all = "camelCase")]
pub struct SpanEntry<'a> {
	pub id: u64,

	/// Span metadata
	#[serde(flatten)]
	pub meta: Metadata<'a>,

	/// Span name
	pub name: &'a str,

	/// The total time of the span
	#[type_def(type_of = "String")]
	pub total_duration: Duration,

	/// The total time for which it was entered
	#[type_def(type_of = "String")]
	pub busy_duration: Duration,

	/// The total time that the span existed but was not entered
	#[type_def(type_of = "String")]
	pub idle_duration: Duration,

	/// Child nodes, either spans or logs, associated with this span.
	#[type_def(skip)]
	pub nodes: Vec<Tree<'a>>,
}

impl<'a> From<SpanEntry<'a>> for Tree<'a> {
	fn from(val: SpanEntry<'a>) -> Self {
		Tree::Span(val)
	}
}

impl<'a> SpanEntry<'a> {
	pub fn new(id: u64, meta: Metadata<'a>, name: &'static str) -> Self {
		Self {
			id,
			meta,
			name,
			total_duration: Duration::ZERO,
			busy_duration: Duration::ZERO,
			idle_duration: Duration::ZERO,
			nodes: Vec::new(),
		}
	}
}

/// Application metrics.
///
/// These metrics are not inherently provided by Tauri. Instead, they are
/// derived from various events and methods tailored for custom monitoring.
/// This setup offers flexibility, allowing easy extension and addition of
/// more metrics based on future needs.

#[derive(Serialize, Debug, Clone, TypeDef)]
#[serde(rename_all = "camelCase")]
pub struct AppMetrics {
	/// Tauri application initialization time
	#[type_def(type_of = "String")]
	pub initialized_at: u128,
	/// Tauri applicatin reported `AppReady` time
	#[type_def(type_of = "String")]
	pub ready_at: u128,
}

impl Default for AppMetrics {
	fn default() -> Self {
		Self {
			initialized_at: now(),
			ready_at: 0,
		}
	}
}

/// Current system time (unix timestamp in ms)
pub fn now() -> u128 {
	SystemTime::now()
		.duration_since(UNIX_EPOCH)
		.unwrap_or_default()
		.as_millis()
}
