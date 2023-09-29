use crate::instrument::{Filter, Filterable};
use crate::metadata::Level;
use crate::Metadata;

pub use crate::generated::rs::devtools::logs::*;

impl Filterable for LogEvent {
	fn match_filter(&self, meta: &Metadata, filter: &Filter) -> bool {
		// match level
		filter.matches_level(&Level::try_from(meta.level).unwrap())
			// match file
			&& meta.location.as_ref().map_or(true, |l| filter.matches_file(l.file()))
			// match message
			&& filter.matches_text(&self.message)
	}
}
