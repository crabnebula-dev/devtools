use futures::FutureExt;
use jsonrpsee::tokio::sync::mpsc;
use std::cmp;
use std::time::Duration;
use tauri_devtools_shared::{LogEntry, SpanEntry, Tree};
use tokio::sync::{broadcast, watch};

/// The batch size for broadcasting.
const BATCH_SIZE: usize = 50;
/// The interval for broadcasting logs and spans.
const BROADCAST_INTERVAL: Duration = Duration::from_millis(400);

/// `Broadcaster` serves as the default [`Dispatcher`] used for the inspector protocol.
///
/// It relays [`Tree`] entries directly to broadcast channel subscribers. If there are no subscribers,
/// the event is dropped.
///
/// The `Broadcaster` holds two separate queues:
/// - `logs_queue` for log entries, and
/// - `spans_queue` for span entries.
pub(crate) struct Broadcaster {
	trees_in: mpsc::UnboundedReceiver<Tree>,
	// TODO make bounded
	shutdown_in: watch::Receiver<()>,

	logs_queue: Vec<LogEntry>,
	spans_queue: Vec<SpanEntry>,

	logs_out: broadcast::Sender<Vec<LogEntry>>,
	spans_out: broadcast::Sender<Vec<SpanEntry>>,
}

impl Broadcaster {
	pub fn new(
		trees_in: mpsc::UnboundedReceiver<Tree>,
		shutdown_in: watch::Receiver<()>,
		logs_out: broadcast::Sender<Vec<LogEntry>>,
		spans_out: broadcast::Sender<Vec<SpanEntry>>,
	) -> Self {
		Self {
			trees_in,
			shutdown_in,
			logs_queue: vec![],
			spans_queue: vec![],
			logs_out,
			spans_out,
		}
	}
	pub async fn run(mut self) {
		let mut interval = tokio::time::interval(BROADCAST_INTERVAL);

		loop {
			let should_broadcast = tokio::select! {
				// Handle interval ticks.
				_ = interval.tick() => {
					// If both logs and spans queues are empty, simply wait for the next iteration.

					!self.logs_queue.is_empty() || !self.spans_queue.is_empty()
				}
				// Wait for shutdown signal.
				_ = self.shutdown_in.changed() => {
					self.broadcast();
					break;
				}
			};

			while let Some(maybe_tree) = self.trees_in.recv().now_or_never() {
				match maybe_tree {
					Some(tree) => {
						self.update_state(tree);
					}
					// The channel closed, no more events will be emitted...time
					// to stop aggregating.
					None => {
						tracing::debug!("event channel closed; terminating");
						return;
					}
				};
			}

			if should_broadcast {
				self.broadcast();
			}
		}
	}

	/// Takes in a Tree and pushes it to the internal queues of the broadcaster
	fn update_state(&mut self, tree: Tree) {
		match tree {
			// Received a new log (event)
			Tree::Log(event) => {
				self.logs_queue.push(event);
			}
			// Received a new span
			Tree::Span(span) => {
				self.spans_queue.push(span);
			}
		}
	}

	/// Broadcasts new log or span events to the outbound channels if necessary
	fn broadcast(&mut self) {
		if !self.logs_queue.is_empty() {
			let size = cmp::min(self.logs_queue.len(), BATCH_SIZE);
			let logs = self.logs_queue.drain(..size).collect();
			// error is ignored as it'll fails if
			// there is no subscriber on the broadcast channel
			let _ = self.logs_out.send(logs);
		}

		if !self.spans_queue.is_empty() {
			let size = cmp::min(self.spans_queue.len(), BATCH_SIZE);
			let logs = self.spans_queue.drain(..size).collect();
			// error is ignored as it'll fails if
			// there is no subscriber on the broadcast channel
			let _ = self.spans_out.send(logs);
		}
	}
}
