use crate::common;

mod generated {
    #![allow(warnings)]

    tonic::include_proto!("rs.tauri.devtools.trace");
}

pub use generated::*;

impl TraceEvent {
    pub fn register_thread(span: common::Span) -> Self {
        Self {
            inner: Some(trace_event::Inner::NewSpan(span)),
        }
    }
    pub fn register_metadata(metadata: Vec<common::register_metadata::NewMetadata>) -> Self {
        Self {
            inner: Some(trace_event::Inner::RegisterMetadata(
                common::RegisterMetadata { metadata },
            )),
        }
    }
    pub fn new_span(span: common::Span) -> Self {
        Self {
            inner: Some(trace_event::Inner::NewSpan(span)),
        }
    }
    pub fn enter_span(span_id: common::SpanId, at: prost_types::Timestamp) -> Self {
        Self {
            inner: Some(trace_event::Inner::EnterSpan(trace_event::Enter {
                span_id: Some(span_id),
                // TODO `ThreadId::as_u64` is currently nightly only. Reenable once stable
                thread_id: Some(0),
                at: Some(at),
            })),
        }
    }
    pub fn exit_span(span_id: common::SpanId, at: prost_types::Timestamp) -> Self {
        Self {
            inner: Some(trace_event::Inner::ExitSpan(trace_event::Exit {
                span_id: Some(span_id),
                // TODO `ThreadId::as_u64` is currently nightly only. Reenable once stable
                thread_id: Some(0),
                at: Some(at),
            })),
        }
    }
    pub fn close_span(span_id: common::SpanId, at: prost_types::Timestamp) -> Self {
        Self {
            inner: Some(trace_event::Inner::CloseSpan(trace_event::Close {
                span_id: Some(span_id),
                at: Some(at),
            })),
        }
    }
    pub fn event(event: trace_event::Event) -> Self {
        Self {
            inner: Some(trace_event::Inner::Event(event)),
        }
    }
}
