use super::Config;
use crate::dispatch::broadcast::BroadcastDispatcher;
use inspector_protocol_primitives::{LogEntry, Metadata, SpanEntry};

pub struct BroadcastConfig;
impl Config for BroadcastConfig {
	type Log = LogEntry;
	type Span = SpanEntry;
	type Metadata = Metadata;
	type Dispatcher = BroadcastDispatcher<Self>;
}
