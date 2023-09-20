use broadcast::Broadcaster;
pub use broadcast::{BroadcastConfig, BroadcastConfigBuilder};
use inspector_protocol_primitives::Tree;
use tokio::sync::mpsc;

mod broadcast;

/// `Dispatcher` trait defines a method for dispatching input data of type `Tree`.
pub trait Dispatcher<'a> {
	/// Dispatches the provided `Tree` input.
	///
	/// Implementors of this trait can determine the desired logic for handling the
	/// dispatched tree.
	fn dispatch(&self, input: Tree<'a>);
}

/// `NoopDispatcher` is a dispatcher that performs no operation
///  when a new entry is added. Mainly used for testing purpose.
#[derive(Default)]
pub struct NoopDispatcher {}

impl<'a> Dispatcher<'a> for NoopDispatcher {
	fn dispatch(&self, _input: Tree<'a>) {}
}

impl NoopDispatcher {
	/// Creates a new `NoopDispatcher`.
	pub fn new() -> Self {
		Default::default()
	}
}

/// Default broadcaster for the Inspector protocol. This leverage
/// the builtin [Broadcaster].
pub struct BroadcastDispatcher<'a> {
	// FIXME: Use bounded channel?
	out: mpsc::UnboundedSender<Tree<'a>>,
}

impl<'a: 'static> Dispatcher<'a> for BroadcastDispatcher<'a> {
	fn dispatch(&self, event: Tree<'a>) {
		// Dispatches the given `event` to the underlying broadcast channel.
		//
		// If an error occurs while sending the event, an error message will be printed to stderr.
		if let Err(err) = self.out.send(event) {
			eprint!("[inspector-protocol] Cannot send event. Error: {err:?}");
		};
	}
}

impl<'a: 'static> BroadcastDispatcher<'a> {
	/// Creates a new `BroadcastDispatcher` with the provided [BroadcastConfig].
	///
	/// The broadcaster will start processing data in the background, either on the default Tokio runtime
	/// or on a specified Tokio handle provided in the `config`.
	pub(crate) fn new(config: BroadcastConfig<'a>) -> Self {
		let (out, rx) = mpsc::unbounded_channel();
		match config.tokio_handle().as_ref() {
			Some(tokio_handle) => tokio_handle.spawn(Broadcaster::new(config).run(rx)),
			None => tokio::spawn(Broadcaster::new(config).run(rx)),
		};

		Self { out }
	}
}
