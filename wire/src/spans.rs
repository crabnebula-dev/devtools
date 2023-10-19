use crate::common;

mod generated {
    #![allow(warnings)]
    include!("./generated/rs.devtools.spans.rs");
}

pub use generated::*;

impl SpanEvent {
    pub fn new_span(
        at: prost_types::Timestamp,
        id: tracing_core::span::Id,
        metadata: &'static tracing_core::Metadata<'static>,
        fields: Vec<common::Field>,
        parent: Option<tracing_core::span::Id>,
    ) -> Self {
        Self {
            event: Some(span_event::Event::NewSpan(span_event::Span {
                id: Some(id.into()),
                metadata_id: Some(metadata.into()),
                fields,
                at: Some(at),
                parent: parent.map(|id| id.into()),
            })),
        }
    }

    pub fn enter_span(
        at: prost_types::Timestamp,
        id: tracing_core::span::Id,
        thread_id: u64,
    ) -> Self {
        Self {
            event: Some(span_event::Event::EnterSpan(span_event::Enter {
                span_id: Some(id.into()),
                thread_id,
                at: Some(at),
            })),
        }
    }

    pub fn exit_span(
        at: prost_types::Timestamp,
        id: tracing_core::span::Id,
        thread_id: u64,
    ) -> Self {
        Self {
            event: Some(span_event::Event::ExitSpan(span_event::Exit {
                span_id: Some(id.into()),
                thread_id,
                at: Some(at),
            })),
        }
    }

    pub fn close_span(at: prost_types::Timestamp, id: tracing_core::span::Id) -> Self {
        Self {
            event: Some(span_event::Event::CloseSpan(span_event::Close {
                span_id: Some(id.into()),
                at: Some(at),
            })),
        }
    }
}
