use crate::ser;
use serde::Deserialize;
use tracing::Level;

/// Struct representing different types of filters.
///
/// Filters are criteria that can be used to selectively include or exclude items
/// based on certain conditions. They are particularly useful in logging or tracing
/// scenarios where only specific kinds of information are of interest.
///
/// The filter has optional fields for different types of criteria:
/// - `Level`: To filter based on logging level.
/// - `Text`: To filter based on a textual substring within the item.
/// - `File`: To filter based on the source file path of the item.
///
/// Note: This struct doesn't include any builder methods, as it is intended to be
/// directly deserialized from WebSocket parameters.
#[derive(Deserialize)]
pub struct Filter {
	/// A filter variant for log level.
	///
	/// This variant checks if an item's log level matches the specified level.
	/// Levels are typically used in logging systems to categorize the importance or verbosity
	/// of a log entry. Levels include INFO, DEBUG, TRACE, WARN, and ERROR.
	#[serde(default)]
	#[serde(deserialize_with = "ser::level_from_string")]
	pub level: Option<Level>,
	/// A filter variant for text content.
	///
	/// This variant checks if an item's content contains the specified text substring.
	/// It's useful for cases where you want to filter logs or spans based on specific keywords
	/// or phrases.
	#[serde(default)]
	pub text: Option<String>,
	/// A filter variant for the source file path.
	///
	/// This variant checks if an item's content contains the specified file substring.
	#[serde(default)]
	pub file: Option<String>,
}

/// Implements utility methods for filtering based on different criteria.
impl Filter {
	/// Checks if a given file name matches the filter's `file` criteria.
	///
	/// This method will return `true` under two conditions:
	/// - The `file` filter is set (`Some`), and the given file name contains the substring defined in the filter.
	/// - The `file` filter is not set (`None`).
	pub fn matches_file(&self, file: &str) -> bool {
		self.file.as_ref().map_or(true, |v| file.contains(v))
	}

	/// Checks if a given text matches the filter's `text` criteria.
	///
	/// This method will return `true` under two conditions:
	/// - The `text` filter is set (`Some`), and the given text contains the substring defined in the filter.
	/// - The `text` filter is not set (`None`).
	pub fn matches_text(&self, text: &str) -> bool {
		self.text.as_ref().map_or(true, |v| text.contains(v))
	}

	/// Checks if a given log level matches the filter's `level` criteria.
	///
	/// This method will return `true` under two conditions:
	/// - The `level` filter is set (`Some`), and the given log level matches
	///   the one defined in the filter.
	/// - The `level` filter is not set (`None`).
	pub fn matches_level(&self, level: &Level) -> bool {
		self.level.map_or(true, |v| v == *level)
	}
}
