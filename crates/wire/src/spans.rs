use crate::common;

mod generated {
    #![allow(warnings)]
    #![allow(clippy::all, clippy::pedantic)]
    include!("./generated/rs.devtools.spans.rs");
}

pub use generated::*;

impl SpanEvent {
    #[must_use]
    pub fn new_span(
        at: prost_types::Timestamp,
        id: &tracing_core::span::Id,
        metadata: &'static tracing_core::Metadata<'static>,
        fields: Vec<common::Field>,
        parent: Option<tracing_core::span::Id>,
    ) -> Self {
        Self {
            event: Some(span_event::Event::NewSpan(span_event::Span {
                id: id.into_u64(),
                metadata_id: std::ptr::from_ref(metadata) as u64,
                fields,
                at: Some(at),
                parent: parent.map(|id| id.into_u64()),
            })),
        }
    }

    #[must_use]
    pub fn enter_span(
        at: prost_types::Timestamp,
        id: &tracing_core::span::Id,
        thread_id: u64,
    ) -> Self {
        Self {
            event: Some(span_event::Event::EnterSpan(span_event::Enter {
                span_id: id.into_u64(),
                thread_id,
                at: Some(at),
            })),
        }
    }

    #[must_use]
    pub fn exit_span(
        at: prost_types::Timestamp,
        id: &tracing_core::span::Id,
        thread_id: u64,
    ) -> Self {
        Self {
            event: Some(span_event::Event::ExitSpan(span_event::Exit {
                span_id: id.into_u64(),
                thread_id,
                at: Some(at),
            })),
        }
    }

    #[must_use]
    pub fn close_span(at: prost_types::Timestamp, id: &tracing_core::span::Id) -> Self {
        Self {
            event: Some(span_event::Event::CloseSpan(span_event::Close {
                span_id: id.into_u64(),
                at: Some(at),
            })),
        }
    }

    #[must_use]
    pub fn span_recorded(id: &tracing_core::span::Id, fields: Vec<common::Field>) -> Self {
        Self {
            event: Some(span_event::Event::Recorded(span_event::Recorded {
                span_id: id.into_u64(),
                fields,
            })),
        }
    }
}
