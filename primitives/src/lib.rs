pub use asset::{Asset, AssetParams};
pub use inspector::{Inspector, InspectorBuilder, InspectorChannels, InspectorMetrics};
use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};
pub use tauri::{AppHandle, Manager, Runtime};

mod asset;
mod inspector;

/// Panic if an expression doesn't evaluate to `Ok`.
///
/// Used as `assert_ok!(expression_to_assert, expected_ok_expression)`,
/// or `assert_ok!(expression_to_assert)` which would assert against `Ok(())`.
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

/// This enum represents internal events within the application.
/// For now, it has only one variant, `AppReady`, which indicates
/// the application's readiness state.
///
/// More events can be added as needed in the future.
#[derive(Debug, Clone)]
pub enum InternalEvent {
	/// Application is ready
	AppReady,
}

/// Logs captured from `tracing`
#[derive(Debug, Serialize, Clone)]
pub struct LogEntry {
	/// Timestamp marking the log entry's creation
	pub timestamp: u128,
	/// The main content of the log
	pub message: String,
	/// Identifies the part of the system where the log was produced (e.g., a library or module)
	pub target: String,
	/// Represents the severity level of the log (e.g., "TRACE", "DEBUG", "ERROR")
	pub level: String,
	/// The path to the module where the log was produced
	pub module_path: String,
	/// The source file that produced the log
	pub file: String,
	/// The line number in the source file where the log was produced
	pub line: u64,
}

/// Current system time (unix timestamp in ms)
pub fn now() -> u128 {
	SystemTime::now()
		.duration_since(UNIX_EPOCH)
		.unwrap_or_default()
		.as_millis()
}
