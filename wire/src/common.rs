mod generated {
	#![allow(clippy::all)]
	#![allow(warnings)]

	tonic::include_proto!("rs.devtools.common");
}

pub use generated::*;

impl From<tracing_core::span::Id> for SpanId {
	fn from(value: tracing_core::span::Id) -> Self {
		SpanId { id: value.into_u64() }
	}
}

impl From<tracing_core::Level> for metadata::Level {
	fn from(level: tracing_core::Level) -> Self {
		match level {
			tracing_core::Level::ERROR => metadata::Level::Error,
			tracing_core::Level::WARN => metadata::Level::Warn,
			tracing_core::Level::INFO => metadata::Level::Info,
			tracing_core::Level::DEBUG => metadata::Level::Debug,
			tracing_core::Level::TRACE => metadata::Level::Trace,
		}
	}
}

impl From<tracing_core::metadata::Kind> for metadata::Kind {
	fn from(kind: tracing_core::metadata::Kind) -> Self {
		match kind {
			tracing_core::metadata::Kind::SPAN => metadata::Kind::Span,
			tracing_core::metadata::Kind::EVENT => metadata::Kind::Event,
			_ => panic!(),
		}
	}
}

impl<'a> From<&'a tracing_core::Metadata<'a>> for Metadata {
	fn from(meta: &'a tracing_core::Metadata<'a>) -> Self {
		let kind = if meta.is_span() {
			metadata::Kind::Span
		} else {
			metadata::Kind::Event
		};

		let field_names = meta.fields().iter().map(|f| f.name().to_string()).collect();
		Metadata {
			name: meta.name().to_string(),
			target: meta.target().to_string(),
			location: Some(meta.into()),
			kind: kind as i32,
			level: metadata::Level::from(*meta.level()) as i32,
			field_names,
			..Default::default()
		}
	}
}

impl From<&'static tracing_core::Metadata<'static>> for NewMetadata {
	fn from(value: &'static tracing_core::Metadata<'static>) -> Self {
		NewMetadata {
			id: Some(value.into()),
			metadata: Some(value.into()),
		}
	}
}

impl<'a> From<&'a tracing_core::Metadata<'a>> for Location {
	fn from(meta: &'a tracing_core::Metadata<'a>) -> Self {
		Location {
			file: meta.file().map(String::from),
			module_path: meta.module_path().map(String::from),
			line: meta.line(),
			column: None, // tracing doesn't support columns yet
		}
	}
}

impl<'a> From<&'a std::panic::Location<'a>> for Location {
	fn from(loc: &'a std::panic::Location<'a>) -> Self {
		Location {
			file: Some(loc.file().to_string()),
			module_path: None,
			line: Some(loc.line()),
			column: Some(loc.column()),
		}
	}
}

impl From<&'static tracing_core::Metadata<'static>> for MetaId {
	fn from(meta: &'static tracing_core::Metadata) -> Self {
		MetaId {
			id: meta as *const _ as u64,
		}
	}
}

impl From<i64> for field::Value {
	fn from(val: i64) -> Self {
		field::Value::I64Val(val)
	}
}

impl From<u64> for field::Value {
	fn from(val: u64) -> Self {
		field::Value::U64Val(val)
	}
}

impl From<bool> for field::Value {
	fn from(val: bool) -> Self {
		field::Value::BoolVal(val)
	}
}

impl From<&str> for field::Value {
	fn from(val: &str) -> Self {
		field::Value::StrVal(val.into())
	}
}

impl From<&str> for field::Name {
	fn from(val: &str) -> Self {
		field::Name::StrName(val.into())
	}
}

impl From<&dyn std::fmt::Debug> for field::Value {
	fn from(val: &dyn std::fmt::Debug) -> Self {
		field::Value::DebugVal(format!("{:?}", val))
	}
}
