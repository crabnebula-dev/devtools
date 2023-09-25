use std::marker::PhantomData;

use inspector_protocol_primitives::{EntryT, LogEntry, Runtime, SpanEntry, Wry};

/// Represents a generic configuration trait for the server.
///
/// This configuration ensures that the server setup is adaptable
/// to various scenarios and can be customized as needed.
pub trait Config
where
	Self: Sized + 'static,
{
	type Log: EntryT;
	type Span: EntryT;
	type Runtime: Runtime;
}

/// The default configuration for the server context.
///
/// This configuration provides a setup suitable for most scenarios
pub struct DefaultConfig<R = Wry>(PhantomData<R>)
where
	R: Runtime;

impl<R: Runtime> Config for DefaultConfig<R> {
	type Log = LogEntry;
	type Span = SpanEntry;
	type Runtime = R;
}
