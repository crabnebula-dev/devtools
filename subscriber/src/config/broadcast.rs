use super::Config;
use crate::dispatch::broadcast::BroadcastDispatcher;
use inspector_protocol_primitives::{LogEntry, Metadata, SpanEntry};

/// The default configuration for the subscriber.
///
/// This configuration enables the standard functionalities provided,
/// leveraging the typical entry types and broadcast dispatching mechanism.
pub struct DefaultConfig;

impl Config for DefaultConfig {
	type Log = LogEntry;
	type Span = SpanEntry;
	type Metadata = Metadata;
	type Dispatcher = BroadcastDispatcher<Self>;
}
