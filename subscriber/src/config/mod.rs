use crate::dispatch::Dispatcher;
pub use broadcast::DefaultConfig;
use inspector_protocol_primitives::{LogManagerT, MetaT, SpanManagerT};
pub use noop::NoopConfig;

pub mod broadcast;
pub mod noop;

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
