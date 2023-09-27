use crate::{Field, FieldSet};
use serde::Deserializer;
use std::fmt::Formatter;
use serde::de::MapAccess;

pub(super) fn fieldset<'de, D>(deserializer: D) -> Result<FieldSet, D::Error> where D: Deserializer<'de> {
	struct Visitor;

	impl<'de> serde::de::Visitor<'de> for Visitor {
		type Value = FieldSet;

		fn expecting(&self, formatter: &mut Formatter) -> std::fmt::Result {
			write!(formatter, "A map")
		}

		fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error> where A: MapAccess<'de> {
			let mut fields = Vec::with_capacity(map.size_hint().unwrap_or(0));
			while let Some((key, value)) = map.next_entry()? {
				fields.push(Field::new(key, value));
			}
			Ok(fields)
		}
	}

	deserializer.deserialize_map(Visitor)
}