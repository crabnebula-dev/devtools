use crate::dispatch::Dispatcher;
use inspector_protocol_primitives::{LogManagerT, MetaT, SpanManagerT};

pub mod broadcast;
pub mod noop;

pub use broadcast::DefaultConfig;
pub use noop::NoopConfig;

/// Represents a generic configuration trait for the subscriber.
///
/// This trait encapsulates the key entities related to the subscriber
/// and ties them together for a cohesive setup. It's designed to
/// be flexible, allowing for both predefined and custom configurations.
pub trait Config
where
	Self: Sized + 'static,
{
	/// Metadata type that provides additional context for logs and spans.
	type Metadata: MetaT<'static>;
	/// Log entry type that adheres to a `LogManagerT`.
	type Log: LogManagerT<Self::Metadata>;
	/// Span entry type that adheres to a `SpanManagerT`.
	type Span: SpanManagerT<Self::Metadata>;
	/// The dispatcher used to handle logs and spans in this configuration.
	type Dispatcher: Dispatcher<Self>;
}
