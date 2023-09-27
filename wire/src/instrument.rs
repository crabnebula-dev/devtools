use crate::metadata::Level;
use crate::{common, logs, spans};

mod generated {
	#![allow(clippy::all)]
	#![allow(warnings)]

	tonic::include_proto!("rs.devtools.instrument");
}

use crate::tauri::Metrics;
pub use generated::*;

bitflags::bitflags! {
	#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
	pub struct Interests: u32 {
		const Logs  = 0b0001;
		const Spans = 0b0010;
	}
}

pub trait Filterable {
	/// Determines if the current item matches the provided filter.
	fn match_filter(&self, filter: &Filter) -> bool;
}

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
		self.level.map_or(true, |v| Level::try_from(v).unwrap() == *level)
	}
}
