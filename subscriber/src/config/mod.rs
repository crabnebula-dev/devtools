use crate::dispatch::Dispatcher;
use inspector_protocol_primitives::{EntryT, LogManagerT, MetaT, SpanManagerT};

pub mod broadcast;
pub mod noop;

pub use broadcast::BroadcastConfig;
pub use noop::NoopConfig;

pub trait Config
where
	Self: Sized + 'static,
{
	type Metadata: MetaT<'static>;
	type Log: EntryT + LogManagerT<Self::Metadata>;
	type Span: EntryT + SpanManagerT<Self::Metadata>;
	type Dispatcher: Dispatcher<Self>;
}
