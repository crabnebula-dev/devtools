use crate::config::Config;
use inspector_protocol_primitives::Tree;

pub mod broadcast;
pub mod noop;

pub use broadcast::{BroadcastConfigBuilder, BroadcastDispatcher};
pub use noop::NoopDispatcher;

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
