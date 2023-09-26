pub use asset::{Asset, AssetParams};
pub use field::{Field, FieldSet};
pub use filter::{Filter, Filterable};
use serde::{Deserialize, Serialize};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
pub use tauri::{AppHandle, Manager, Runtime};
pub use tracing::Level;

mod asset;
mod field;
mod filter;
mod ser;

/// Enum representing a [LogEntry] or a [SpanEntry]
#[derive(Debug, Serialize, Clone)]
pub enum Tree {
	Log(LogEntry),
	Span(SpanEntry),
}

/// Custom metrics.
///
/// These metrics are not inherently provided by Tauri. Instead, they are
/// derived from various events and methods tailored for custom monitoring.
/// This setup offers flexibility, allowing easy extension and addition of
/// more metrics based on future needs.

#[derive(Serialize, Debug, Clone)]
pub struct Metrics {
	/// Tauri application initialization time
	pub initialized_at: u128,
	/// Tauri application reported `AppReady` time
	pub ready_at: u128,
}

/// Holds metadata for logs and spans entry.
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Metadata {
	/// The timestamp of the entry, represented as a unix timestamp in milliseconds.
	pub timestamp: u128,
	/// The entry level (e.g., INFO, ERROR).
	#[serde(serialize_with = "ser::to_string")]
	pub level: &'static Level,
	/// The target of the entry directive.
	pub target: &'static str,
	/// The path to the module where the entry was produced
	pub module_path: Option<&'static str>,
	/// The source file that produced the entry
	pub file: Option<&'static str>,
	/// The line number in the source file where the entry was produced
	pub line: Option<u32>,
	/// Additional key-value data associated with the entry.
	#[serde(serialize_with = "ser::fieldset")]
	pub fields: FieldSet,
}

impl Metadata {
	pub fn new(meta: &'static tracing::Metadata<'static>, fields: Vec<Field>) -> Self {
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
pub struct LogEntry {
	/// Span linked with this log entry.
	pub span: Option<u64>,

	/// Shared fields between events and spans.
	#[serde(flatten)]
	pub meta: Metadata,

	/// The main content of the log
	pub message: Option<String>,
}

impl<'a> LogEntry {
	pub fn new(span: Option<u64>, meta: Metadata, message: Option<String>) -> Self {
		Self { span, meta, message }
	}
}

impl From<LogEntry> for Tree {
	fn from(val: LogEntry) -> Self {
		Tree::Log(val)
	}
}

/// Implementation of the [`Filterable`] trait for the `LogEntry` struct.
///
/// This implementation provides the logic to determine whether a `LogEntry`
/// matches a given filter.
impl Filterable for LogEntry {
	fn match_filter(&self, filter: &Filter) -> bool {
		// match level
		filter.matches_level(self.meta.level)
			// match file
			&& self.meta.file.map_or(true, |f| filter.matches_file(f))
			// match message
			&& self.message.as_ref().map_or(true, |m| filter.matches_text(m))
	}
}

/// A span captured from the `tracing` crate.
///
/// A span represents a period of time or a unit of work in the application.
#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SpanEntry {
	/// Span unique id
	pub id: u64,
	/// Span metadata
	#[serde(flatten)]
	pub meta: Metadata,
	/// Span name
	pub name: &'static str,
	/// Span status
	pub status: SpanStatus,
	/// Parent span
	pub parent: Option<u64>,
}

/// Implementation of the [`Filterable`] trait for the `SpanEntry` struct.
///
/// This implementation provides the logic to determine whether a `SpanEntry`
/// matches a given filter.
impl Filterable for SpanEntry {
	fn match_filter(&self, filter: &Filter) -> bool {
		// match level
		filter.matches_level(self.meta.level)
			// match file
			&& self.meta.file.map_or(true, |f| filter.matches_file(f))
			// match text in target or name
			&& (filter.matches_text(self.meta.target) || filter.matches_text(self.name))
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

impl From<SpanEntry> for Tree {
	fn from(val: SpanEntry) -> Self {
		Tree::Span(val)
	}
}

impl SpanEntry {
	pub fn new(id: u64, parent: Option<u64>, meta: Metadata, name: &'static str) -> Self {
		Self {
			id,
			meta,
			name,
			status: SpanStatus::Created,
			parent,
		}
	}
}

/// Optional parameters for establishing a websocket subscription.
///
/// Note that `SubscriptionParams` is designed for future extensibility.
/// This means that additional fields may be added later on, which is why the
/// `Filter` object is wrapped in this struct rather than being exposed directly.
#[derive(Deserialize)]
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

#[cfg(test)]
mod tests {
	use super::*;
	use tracing::Level;

	// Helper function to create a mock SpanEntry for testing.
	fn mock_entries<'a>(
		level: &'a Level,
		file: Option<&'a str>,
		target: &'a str,
		name: &'a str,
	) -> (SpanEntry, LogEntry) {
		let meta = Metadata {
			level,
			file,
			target,
			timestamp: Default::default(),
			module_path: None,
			line: Default::default(),
			fields: Default::default(),
		};
		(
			SpanEntry {
				id: 0,
				parent: None,
				status: SpanStatus::Created,
				meta: meta.clone(),
				name,
			},
			LogEntry {
				meta: meta.clone(),
				span: None,
				message: Some(format!("Message from {} in target {}", name, target)),
			},
		)
	}

	#[test]
	fn filter_level() {
		let filter = Filter {
			level: Some(Level::INFO),
			file: None,
			text: None,
		};
		let (span_entry, log_entry) = mock_entries(&Level::INFO, Some("main.rs"), "target", "name");
		assert!(span_entry.match_filter(&filter));
		assert!(log_entry.match_filter(&filter));
	}

	#[test]
	fn filter_file() {
		let filter = Filter {
			level: None,
			file: Some(String::from("main.rs")),
			text: None,
		};
		let (span_entry, log_entry) = mock_entries(&Level::DEBUG, Some("main.rs"), "target", "name");
		assert!(span_entry.match_filter(&filter));
		assert!(log_entry.match_filter(&filter));
	}

	#[test]
	fn filter_text_in_target() {
		let filter = Filter {
			level: None,
			file: None,
			text: Some(String::from("target")),
		};
		let (span_entry, log_entry) = mock_entries(&Level::DEBUG, None, "target", "name");
		assert!(span_entry.match_filter(&filter));
		assert!(log_entry.match_filter(&filter));
	}

	#[test]
	fn filter_text_in_name() {
		let filter = Filter {
			level: None,
			file: None,
			text: Some(String::from("name")),
		};
		let (span_entry, log_entry) = mock_entries(&Level::DEBUG, None, "target", "name");
		assert!(span_entry.match_filter(&filter));
		assert!(log_entry.match_filter(&filter));
	}

	#[test]
	fn filter_combination() {
		let filter = Filter {
			level: Some(Level::DEBUG),
			file: Some(String::from("main.rs")),
			text: Some(String::from("target")),
		};
		let (span_entry, log_entry) = mock_entries(&Level::DEBUG, Some("main.rs"), "target", "name");
		assert!(span_entry.match_filter(&filter));
		assert!(log_entry.match_filter(&filter));
	}

	#[test]
	fn filter_no_match() {
		let filter = Filter {
			level: Some(Level::ERROR),
			file: Some(String::from("other.rs")),
			text: Some(String::from("miss")),
		};
		let (span_entry, log_entry) = mock_entries(&Level::DEBUG, Some("main.rs"), "target", "name");
		assert!(!span_entry.match_filter(&filter));
		assert!(!log_entry.match_filter(&filter));
	}
}
