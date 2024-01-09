#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Update {
    /// A list of span events that happened since the last update.
    #[prost(message, repeated, tag = "1")]
    pub span_events: ::prost::alloc::vec::Vec<SpanEvent>,
    /// A count of how many log events were dropped because
    /// the event buffer was at capacity.
    ///
    /// If everything is working correctly, this should be 0. If this
    /// number is greater than zero this indicates the event buffers capacity
    /// should be increased or the publish interval decreased.
    #[prost(uint64, tag = "2")]
    pub dropped_events: u64,
}
/// A span event
///
/// Span events are emitted whenever a span lifecycle event happens and are thus rather low-level by nature.
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct SpanEvent {
    #[prost(oneof = "span_event::Event", tags = "1, 2, 3, 4, 5")]
    pub event: ::core::option::Option<span_event::Event>,
}
/// Nested message and enum types in `SpanEvent`.
pub mod span_event {
    /// Represents a period of time in which a program was executing in a particular context.
    ///
    /// Corresponds to `Span` in the `tracing` crate.
    #[allow(clippy::derive_partial_eq_without_eq)]
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Span {
        /// An Id that uniquely identifies it in relation to other spans.
        #[prost(uint64, tag = "1")]
        pub id: u64,
        /// Identifier for metadata describing static characteristics of all spans originating
        /// from that call site, such as its name, source code location, verbosity level, and
        /// the names of its fields.
        #[prost(uint64, tag = "2")]
        pub metadata_id: u64,
        /// User-defined key-value pairs of arbitrary data that describe the context the span represents.
        #[prost(message, repeated, tag = "3")]
        pub fields: ::prost::alloc::vec::Vec<super::super::common::Field>,
        #[prost(uint64, optional, tag = "4")]
        pub parent: ::core::option::Option<u64>,
        /// Timestamp for the span.
        #[prost(message, optional, tag = "5")]
        pub at: ::core::option::Option<::prost_types::Timestamp>,
    }
    #[allow(clippy::derive_partial_eq_without_eq)]
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Enter {
        #[prost(uint64, tag = "1")]
        pub span_id: u64,
        #[prost(uint64, tag = "2")]
        pub thread_id: u64,
        #[prost(message, optional, tag = "3")]
        pub at: ::core::option::Option<::prost_types::Timestamp>,
    }
    #[allow(clippy::derive_partial_eq_without_eq)]
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Exit {
        #[prost(uint64, tag = "1")]
        pub span_id: u64,
        #[prost(uint64, tag = "2")]
        pub thread_id: u64,
        #[prost(message, optional, tag = "3")]
        pub at: ::core::option::Option<::prost_types::Timestamp>,
    }
    #[allow(clippy::derive_partial_eq_without_eq)]
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Close {
        #[prost(uint64, tag = "1")]
        pub span_id: u64,
        #[prost(message, optional, tag = "3")]
        pub at: ::core::option::Option<::prost_types::Timestamp>,
    }
    /// Span recorded values for a list of fields.
    #[allow(clippy::derive_partial_eq_without_eq)]
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Recorded {
        /// An Id that uniquely identifies it in relation to other spans.
        #[prost(uint64, tag = "1")]
        pub span_id: u64,
        /// Data recorded by the span.
        #[prost(message, repeated, tag = "2")]
        pub fields: ::prost::alloc::vec::Vec<super::super::common::Field>,
    }
    #[allow(clippy::derive_partial_eq_without_eq)]
    #[derive(Clone, PartialEq, ::prost::Oneof)]
    pub enum Event {
        #[prost(message, tag = "1")]
        NewSpan(Span),
        #[prost(message, tag = "2")]
        EnterSpan(Enter),
        #[prost(message, tag = "3")]
        ExitSpan(Exit),
        #[prost(message, tag = "4")]
        CloseSpan(Close),
        #[prost(message, tag = "5")]
        Recorded(Recorded),
    }
}
