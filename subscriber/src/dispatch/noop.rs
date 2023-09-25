use super::Dispatcher;
use crate::config::Config;
use inspector_protocol_primitives::Tree;

/// `NoopDispatcher` is a dispatcher that performs no operation
///  when a new entry is added. Mainly used for testing purpose.
#[derive(Default)]
pub struct NoopDispatcher;

impl<C> Dispatcher<C> for NoopDispatcher
where
	C: Config,
{
	// no-op
	fn dispatch(&self, _input: Tree<C::Log, C::Span>) {}
}

impl NoopDispatcher {
	/// Creates a new `NoopDispatcher`.
	pub fn new() -> Self {
		Default::default()
	}
}
