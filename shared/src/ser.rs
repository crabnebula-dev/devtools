use crate::FieldSet;
use serde::{ser::SerializeMap, Deserialize, Deserializer, Serializer};
use std::{fmt::Display, str::FromStr};
use tracing::Level;

/// Serializes any type implementing the `Display` trait into a string.
pub(super) fn to_string<S: Serializer, D: Display>(v: D, serializer: S) -> Result<S::Ok, S::Error> {
	serializer.serialize_str(&v.to_string())
}

/// Serializes a [FieldSet] into a map where each field is a key-value pair.
pub(super) fn fieldset<S: Serializer>(fieldset: &FieldSet, serializer: S) -> Result<S::Ok, S::Error> {
	let mut model = serializer.serialize_map(Some(fieldset.len()))?;
	for field in fieldset {
		model.serialize_entry(field.key(), field.value())?;
	}
	model.end()
}

pub(super) fn level_from_string<'de, D>(deserializer: D) -> Result<Option<Level>, D::Error>
where
	D: Deserializer<'de>,
{
	let s: Option<String> = Deserialize::deserialize(deserializer)?;
	Ok(s.map(|s| Level::from_str(&s).unwrap_or(Level::INFO)))
}