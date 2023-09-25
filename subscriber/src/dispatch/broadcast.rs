use super::Dispatcher;
use crate::config::Config;
use inspector_protocol_primitives::Tree;
use std::fmt::Debug;
use std::{num::NonZeroUsize, time::Duration};
use tokio::runtime::Handle;
use tokio::sync::mpsc;
use tokio::sync::{broadcast, mpsc::UnboundedReceiver, watch};
use tokio::time::interval;

/// Default broadcaster for the Inspector protocol. This leverage
/// the builtin [Broadcaster].
pub struct BroadcastDispatcher<C>
where
	C: Config,
{
	// FIXME: Use bounded channel?
	out: mpsc::UnboundedSender<Tree<C::Log, C::Span>>,
}

impl<C> Dispatcher<C> for BroadcastDispatcher<C>
where
	C: Config,
{
	fn dispatch(&self, event: Tree<C::Log, C::Span>) {
		// Dispatches the given `event` to the underlying broadcast channel.
		//
		// If an error occurs while sending the event, an error message will be printed to stderr.
		if let Err(err) = self.out.send(event) {
			eprint!("[inspector-protocol] Cannot send event. Error: {err:?}");
		};
	}
}

impl<C> BroadcastDispatcher<C>
where
	C: Config,
{
	/// Creates a new `BroadcastDispatcher` with the provided [BroadcastConfig].
	///
	/// The broadcaster will start processing data in the background, either on the default Tokio runtime
	/// or on a specified Tokio handle provided in the `config`.
	pub(crate) fn new(config: BroadcastConfig<C>) -> Self {
		let (out, rx) = mpsc::unbounded_channel();
		match config.tokio_handle().as_ref() {
			Some(tokio_handle) => tokio_handle.spawn(Broadcaster::new(config).run(rx)),
			None => tokio::spawn(Broadcaster::new(config).run(rx)),
		};

		Self { out }
	}
}

// Internal queue processing. It will drain the specified queue up to a given size
// and send the drained data to the designated channel. If there's no listener
// on the channel, the error is ignored.
macro_rules! process_queue_internally {
	( $queue:ident, $batch_size: ident, $channel:ident ) => {
		async {
			let __size = if $queue.len() > $batch_size {
				$batch_size
			} else {
				$queue.len()
			};

			if __size > 0 {
				let data = $queue.drain(..__size).collect();
				// error is ignored as it'll fails if
				// there is no subscriber on the broadcast channel
				let _ = $channel.send(data);
			}
		}
	};
}

/// Configuration struct builder for broadcasting.
///
/// It handles settings like batch sizes, intervals, and channels for logs and spans.
#[derive(Debug, Clone)]
pub struct BroadcastConfigBuilder<C>
where
	C: Config,
{
	batch_size: NonZeroUsize,
	tokio_handle: Option<Handle>,
	interval: Duration,
	logs_out: Option<broadcast::Sender<Vec<C::Log>>>,
	spans_out: Option<broadcast::Sender<Vec<C::Span>>>,
	shutdown_in: Option<watch::Receiver<()>>,
}

impl<C> Default for BroadcastConfigBuilder<C>
where
	C: Config,
{
	fn default() -> Self {
		Self {
			batch_size: NonZeroUsize::new(50).expect("qed; more than 1"),
			interval: Duration::from_millis(400),
			tokio_handle: Default::default(),
			logs_out: Default::default(),
			spans_out: Default::default(),
			shutdown_in: Default::default(),
		}
	}
}

impl<C> BroadcastConfigBuilder<C>
where
	C: Config,
{
	/// Creates a new `BroadcastConfigBuilder`.
	pub fn new() -> Self {
		Default::default()
	}

	/// Sets the batch size for broadcasting.
	/// Default is `50`.
	pub fn with_batch_size<T>(mut self, batch_size: T) -> Self
	where
		T: TryInto<NonZeroUsize>,
		<T as TryInto<NonZeroUsize>>::Error: Debug,
	{
		self.batch_size = batch_size
			.try_into()
			.expect("batch size must be greater than or equal to 1");
		self
	}

	/// Sets the interval for broadcasting logs and spans.
	/// Default is `400ms`.
	pub fn with_interval(mut self, interval: Duration) -> Self {
		self.interval = interval;
		self
	}

	/// Sets the `Sender` used to broadcast new [`LogEntry`].
	pub fn with_logs_sender(mut self, logs: broadcast::Sender<Vec<C::Log>>) -> Self {
		self.logs_out = Some(logs);
		self
	}

	/// Sets the `Sender` used to broadcast new [`SpanEntry`].
	pub fn with_spans_sender(mut self, spans: broadcast::Sender<Vec<C::Span>>) -> Self {
		self.spans_out = Some(spans);
		self
	}

	/// Sets the `Receiver` used to flush the queue on shutdown.
	pub fn with_shutdown_receiver(mut self, receiver: watch::Receiver<()>) -> Self {
		self.shutdown_in = Some(receiver);
		self
	}

	/// Assigns a Tokio runtime.
	pub fn with_tokio_handle(mut self, tokio_handle: Handle) -> Self {
		self.tokio_handle = Some(tokio_handle);
		self
	}

	/// Build a [`BroadcastConfig`].
	pub fn build(self) -> BroadcastConfig<C> {
		BroadcastConfig {
			batch_size: self.batch_size,
			tokio_handle: self.tokio_handle,
			interval: self.interval,
			logs_out: self.logs_out.unwrap_or_else(|| {
				tracing::warn!("No logs channel defined, they will be ignored.",);
				broadcast::channel(1).0
			}),
			spans_out: self.spans_out.unwrap_or_else(|| {
				tracing::warn!("No spans channel defined, they will be ignored.",);
				broadcast::channel(1).0
			}),
			shutdown_in: self.shutdown_in.unwrap_or_else(|| {
				tracing::warn!("No shutdown signal defined, events may be lost.",);
				watch::channel(()).1
			}),
		}
	}
}

/// Configuration struct for broadcasting.
#[derive(Debug)]
pub struct BroadcastConfig<C>
where
	C: Config,
{
	batch_size: NonZeroUsize,
	tokio_handle: Option<Handle>,
	interval: Duration,
	logs_out: broadcast::Sender<Vec<C::Log>>,
	spans_out: broadcast::Sender<Vec<C::Span>>,
	shutdown_in: watch::Receiver<()>,
}

impl<C> BroadcastConfig<C>
where
	C: Config,
{
	/// Return current config [Handle]
	pub(crate) fn tokio_handle(&self) -> Option<Handle> {
		self.tokio_handle.clone()
	}
}

/// `Broadcaster` serves as the default [`Dispatcher`] used for the inspector protocol.
///
/// It relays [`Tree`] entries directly to broadcast channel subscribers. If there are no subscribers,
/// the event is dropped.
///
/// The `Broadcaster` holds two separate queues:
/// - `logs_queue` for log entries, and
/// - `spans_queue` for span entries.
pub(crate) struct Broadcaster<C>
where
	C: Config,
{
	logs_queue: Vec<C::Log>,
	spans_queue: Vec<C::Span>,
	config: BroadcastConfig<C>,
}

impl<C> Broadcaster<C>
where
	C: Config,
{
	pub(crate) fn new(config: BroadcastConfig<C>) -> Self {
		Self {
			config,
			logs_queue: Vec::new(),
			spans_queue: Vec::new(),
		}
	}

	/// Continuously process logs and spans, broadcasting them based on the configured interval and batch size.
	///
	/// This function begins by setting up the required channels and intervals based on the [`BroadcastConfig`].
	/// Once ready, it enters a loop where it will either:
	///
	/// 1. Wait for the next tick from the interval timer.
	/// 2. Receive a new `Tree` containing either logs or spans.
	///
	/// If the interval timer ticks, the function checks if the queues for logs and spans are empty.
	/// If they are, it simply continues to the next iteration of the loop. This means that unless there
	/// are logs or spans waiting to be broadcasted, the function will not attempt to broadcast empty data.
	///
	/// When a new `Tree` is received, the function determines if it contains logs or spans. Depending on
	/// its contents, the tree's data is added to the respective queue (either `logs_queue` or `spans_queue`).
	///
	/// If, after adding the new data, the length of the queue surpasses or equals the configured batch size,
	/// the data will be processed and broadcasted. Otherwise, it waits for more data or the next interval tick.
	///
	/// To efficiently broadcast both logs and spans simultaneously, [`tokio::join`] is used. This ensures that
	/// both queues are processed concurrently, and neither has to wait for the other. The internal process for
	/// broadcasting the data is handled by the [`process_queue_internally`] macro, which drains the queue and
	/// sends the data to the respective broadcast channel.
	///
	/// Note: Any errors that arise during the broadcasting process (e.g., if there are no subscribers on the
	/// broadcast channel) are currently ignored.
	///
	/// # Parameters
	///
	/// - `rx`: An unbounded receiver for `Tree`. This is the internal handler.
	pub(crate) async fn run(self, mut rx: UnboundedReceiver<Tree<C::Log, C::Span>>) {
		let Broadcaster {
			mut logs_queue,
			mut spans_queue,
			config,
		} = self;
		// Set up an interval timer based on the provided configuration.
		let mut interval = interval(config.interval);
		let mut shutdown_in = config.shutdown_in;

		let logs_out_channel = config.logs_out;
		let spans_out_channel = config.spans_out;
		let batch_size = config.batch_size.get();

		// Main loop to continuously process received logs and spans.
		loop {
			tokio::select! {
				// Handle interval ticks.
				_ = interval.tick() => {
					// If both logs and spans queues are empty, simply wait for the next iteration.
					if logs_queue.is_empty() && spans_queue.is_empty() {
						continue;
					}
				}
				// Wait for shutdown signal.
				_ = shutdown_in.changed() => {
					// FIXME: Would probably be fair to process in `batch_size`
					let batch_size_logs = logs_queue.len();
					let batch_size_spans = spans_queue.len();

					// Send all events accumulated into our `logs_queue` and `spans_queue`.
					tokio::join!(
						process_queue_internally!(logs_queue, batch_size_logs, logs_out_channel),
						process_queue_internally!(spans_queue, batch_size_spans, spans_out_channel)
					);
					break;
				}
				// Handle received Tree (either containing logs or spans).
				maybe_tree = rx.recv() => {
					let Some(tree) = maybe_tree else {
						// If there's no tree to process, exit the loop.
						break;
					};

					match tree {
						// Received a new log (event)
						Tree::Log(event) => {
							logs_queue.push(event);

							if logs_queue.len() < config.batch_size.into() {
								continue
							}

						},
						// Received a new span
						Tree::Span(span) => {
							spans_queue.push(span);

							if spans_queue.len() < config.batch_size.into() {
								continue
							}
						},
					}
				}
			}

			// Process logs and spans queues, broadcasting the data as necessary
			tokio::join!(
				process_queue_internally!(logs_queue, batch_size, logs_out_channel),
				process_queue_internally!(spans_queue, batch_size, spans_out_channel)
			);
		}
	}
}
