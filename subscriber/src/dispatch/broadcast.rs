use inspector_protocol_primitives::{LogEntry, SpanEntry, Tree};
use std::fmt::Debug;
use std::{num::NonZeroUsize, time::Duration};

use tokio::runtime::Handle;
use tokio::sync::{broadcast::Sender, mpsc::UnboundedReceiver};
use tokio::time::interval;

// Internal queue processing. It will drain the specified queue up to a given size
// and send the drained data to the designated channel. If there's no listener
// on the channel, the error is ignored.
macro_rules! process_queue_internally {
	( $size:ident, $queue:ident, $batch_size: ident, $channel:ident ) => {
		async {
			let $size = if $queue.len() > $batch_size {
				$batch_size
			} else {
				$queue.len()
			};

			if $size > 0 {
				let data = $queue.drain(..$size).collect();
				// error is ignored as it'll fails if
				// there is no subscriber on the broadcast channel
				let _ = $channel.send(data);
			}
		}
	};
}

/// Configuration struct for broadcasting.
///
/// It handles settings like batch sizes, intervals, and channels for logs and spans.
#[derive(Debug, Clone)]
pub struct BroadcastConfig<'a> {
	batch_size: NonZeroUsize,
	tokio_handle: Option<Handle>,
	interval: Duration,
	logs_out: Sender<Vec<LogEntry<'a>>>,
	spans_out: Sender<Vec<SpanEntry<'a>>>,
}

impl<'a> BroadcastConfig<'a> {
	/// Creates a new `BroadcastConfig` with the provided log and span senders.
	///
	/// This sets up default values for the other configuration options.
	pub fn new(logs: Sender<Vec<LogEntry<'a>>>, spans: Sender<Vec<SpanEntry<'a>>>) -> Self {
		Self {
			batch_size: NonZeroUsize::new(50).expect("pre; more than 1"),
			interval: Duration::from_millis(400),
			logs_out: logs,
			spans_out: spans,
			tokio_handle: None,
		}
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

	/// Assigns a Tokio runtime.
	pub fn with_tokio_handle(mut self, tokio_handle: Handle) -> Self {
		self.tokio_handle = Some(tokio_handle);
		self
	}

	/// Return current config [Handle]
	pub(crate) fn tokio_handle(self) -> Option<Handle> {
		self.tokio_handle
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
pub(crate) struct Broadcaster<'a> {
	logs_queue: Vec<LogEntry<'a>>,
	spans_queue: Vec<SpanEntry<'a>>,
	config: BroadcastConfig<'a>,
}

impl<'a: 'static> Broadcaster<'a> {
	pub(crate) fn new(config: BroadcastConfig<'a>) -> Self {
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
	/// - `rx`: An asynchronous unbounded receiver for `Tree`. This is the source from which logs and spans are received.
	pub(crate) async fn run(self, mut rx: UnboundedReceiver<Tree<'a>>) {
		let Broadcaster {
			mut logs_queue,
			mut spans_queue,
			config,
		} = self;
		// Set up an interval timer based on the provided configuration.
		let mut interval = interval(config.interval);

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
				process_queue_internally!(logs_size, logs_queue, batch_size, logs_out_channel),
				process_queue_internally!(spans_size, spans_queue, batch_size, spans_out_channel)
			);
		}
	}
}
