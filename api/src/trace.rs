use crate::common;

mod generated {
    #![allow(warnings)]

    tonic::include_proto!("rs.tauri.devtools.trace");
}

pub use generated::*;

impl TraceEvent {
    pub fn register_thread(span: common::Span) -> Self {
        Self {
            event: Some(trace_event::Event::NewSpan(span)),
        }
    }
    pub fn register_metadata(metadata: Vec<common::register_metadata::NewMetadata>) -> Self {
        Self {
            event: Some(trace_event::Event::RegisterMetadata(
                common::RegisterMetadata { metadata },
            )),
        }
    }
    pub fn new_span(span: common::Span) -> Self {
        Self {
            event: Some(trace_event::Event::NewSpan(span)),
        }
    }
    pub fn enter_span(span_id: common::SpanId, at: prost_types::Timestamp) -> Self {
        Self {
            event: Some(trace_event::Event::EnterSpan(trace_event::Enter {
                span_id: Some(span_id),
                // TODO `ThreadId::as_u64` is currently nightly only. Reenable once stable
                thread_id: 0,
                at: Some(at),
            })),
        }
    }
    pub fn exit_span(span_id: common::SpanId, at: prost_types::Timestamp) -> Self {
        Self {
            event: Some(trace_event::Event::ExitSpan(trace_event::Exit {
                span_id: Some(span_id),
                // TODO `ThreadId::as_u64` is currently nightly only. Reenable once stable
                thread_id: 0,
                at: Some(at),
            })),
        }
    }
    pub fn close_span(span_id: common::SpanId, at: prost_types::Timestamp) -> Self {
        Self {
            event: Some(trace_event::Event::CloseSpan(trace_event::Close {
                span_id: Some(span_id),
                at: Some(at),
            })),
        }
    }
}
