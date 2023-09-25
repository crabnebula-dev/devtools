use crate::config::Config;
pub use broadcast::{BroadcastConfigBuilder, BroadcastDispatcher};
use inspector_protocol_primitives::Tree;
pub use noop::NoopDispatcher;

pub mod broadcast;
pub mod noop;

/// `Dispatcher` trait defines a method for dispatching input data of type `Tree`.
pub trait Dispatcher<C>
where
	C: Config,
	Self: 'static,
{
	/// Dispatches the provided `Tree` input.
	///
	/// Implementors of this trait can determine the desired logic for handling the
	/// dispatched tree.
	fn dispatch(&self, input: Tree<C::Log, C::Span>);
}
