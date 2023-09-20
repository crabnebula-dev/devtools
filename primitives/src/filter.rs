use crate::ser;
use serde::{Deserialize, Serialize};
use tracing::Level;

/// A trait implemented by entries that can be filtered.
///
/// Implementors of this trait can be checked against specific criteria
/// to determine whether they match a given [`Filter`]. This enables dynamic
/// filtering of items based on subscription configurations.
pub trait Filterable {
	/// Determines if the current item matches the provided filter.
	fn match_filter(&self, filter: &Filter) -> bool;
}

/// Enum representing different types of filters.
///
/// Filters are criteria that can be used to selectively include or exclude items
/// based on certain conditions. They are particularly useful in logging or tracing
/// scenarios where only specific kinds of information are of interest.
///
/// # Variants
///
/// * `Level` - Filters items based on the logging level. Uses [`Level`] from the tracing crate.
/// * `Text` - Filters items based on the presence of a specific substring.
#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Filter {
	/// A filter variant for log level.
	///
	/// This variant checks if an item's log level matches the specified level.
	/// Levels are typically used in logging systems to categorize the importance or verbosity
	/// of a log entry. Levels include INFO, DEBUG, TRACE, WARN, and ERROR.
	///
	/// # Fields
	///
	/// * `level` - The desired log level to filter by.
	Level {
		#[serde(serialize_with = "ser::to_string")]
		#[serde(deserialize_with = "ser::level_from_string")]
		level: Level,
	},
	/// A filter variant for text content.
	///
	/// This variant checks if an item's content contains the specified text substring.
	/// It's useful for cases where you want to filter logs or spans based on specific keywords
	/// or phrases.
	///
	/// # Fields
	///
	/// * `text` - The substring to filter by.
	Text { text: String },
}
