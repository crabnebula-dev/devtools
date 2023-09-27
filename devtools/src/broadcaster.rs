use crate::{Command, Event, Watcher};
use futures::FutureExt;
use std::mem;
use std::time::{Duration, Instant, SystemTime};
use tauri_devtools_wire_format as wire;
use tokio::sync::{mpsc, watch};

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
	events: mpsc::Receiver<Event>,
	cmds: mpsc::Receiver<Command>,
	shutdown_in: watch::Receiver<()>,

	watchers: Vec<Watcher>,

	new_metadata: Vec<wire::NewMetadata>,

	new_logs: Vec<wire::logs::LogEvent>,
	new_spans: Vec<wire::spans::SpanEvent>,

	base_time: TimeAnchor,
}

impl Broadcaster {
	pub fn new(events: mpsc::Receiver<Event>, cmds: mpsc::Receiver<Command>, shutdown_in: watch::Receiver<()>) -> Self {
		Self {
			events,
			cmds,
			shutdown_in,
			watchers: vec![],
			new_logs: vec![],
			new_spans: vec![],
			new_metadata: vec![],
			base_time: TimeAnchor::new(),
		}
	}
	pub async fn run(mut self) {
		let mut interval = tokio::time::interval(BROADCAST_INTERVAL);

		loop {
			let should_broadcast = tokio::select! {
				// Handle interval ticks.
				_ = interval.tick() => true,
				// Wait for shutdown signal.
				_ = self.shutdown_in.changed() => {
					self.broadcast();
					break;
				}
				cmd = self.cmds.recv() => {
					match cmd {
						Some(Command::Instrument(watcher)) => {
							self.add_instrument_watcher(watcher);
						}
						None => {
							tracing::debug!("rpc server closed, terminating");
							return;
						}
					};
					false
				}
			};

			while let Some(maybe_tree) = self.events.recv().now_or_never() {
				match maybe_tree {
					Some(event) => {
						self.update_state(event);
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

	fn add_instrument_watcher(&mut self, watcher: Watcher) {
		// TODO send initial update
		self.watchers.push(watcher);
	}

	/// Takes in a Tree and pushes it to the internal queues of the broadcaster
	fn update_state(&mut self, tree: Event) {
		match tree {
			Event::Metadata(meta) => {
				self.new_metadata.push(meta.into());
			}
			// Received a new log (event)
			Event::LogEvent {
				at,
				metadata,
				message,
				fields,
				maybe_parent,
			} => {
				self.new_logs.push(wire::logs::LogEvent {
					at: Some(self.base_time.to_timestamp(at)),
					metadata_id: Some(metadata.into()),
					message,
					fields,
					parent: maybe_parent.map(|id| id.into()),
				});
			}
			Event::NewSpan {
				at,
				id,
				metadata,
				fields,
				maybe_parent,
			} => self.new_spans.push(wire::spans::SpanEvent::new_span(
				self.base_time.to_timestamp(at),
				id,
				metadata,
				fields,
				maybe_parent,
			)),
			Event::EnterSpan { at, span_id, thread_id } => self.new_spans.push(wire::spans::SpanEvent::enter_span(
				self.base_time.to_timestamp(at),
				span_id,
				thread_id,
			)),
			Event::ExitSpan { at, span_id, thread_id } => self.new_spans.push(wire::spans::SpanEvent::exit_span(
				self.base_time.to_timestamp(at),
				span_id,
				thread_id,
			)),
			Event::CloseSpan { at, span_id } => self.new_spans.push(wire::spans::SpanEvent::close_span(
				self.base_time.to_timestamp(at),
				span_id,
			)),
		}
	}
	fn logs_update(&mut self) -> wire::logs::Update {
		let log_events = mem::take(&mut self.new_logs);

		wire::logs::Update {
			log_events,
			dropped_events: 0,
		}
	}

	fn spans_update(&mut self) -> wire::spans::Update {
		let span_events = mem::take(&mut self.new_spans);

		wire::spans::Update {
			span_events,
			dropped_events: 0,
		}
	}

	/// Broadcasts new log or span events to the outbound channels if necessary
	fn broadcast(&mut self) {
		let logs_update = (!self.new_logs.is_empty()).then(|| self.logs_update());
		let spans_update = (!self.new_spans.is_empty()).then(|| self.spans_update());

		let update = wire::instrument::Update {
			now: Some(self.base_time.to_timestamp(Instant::now())),
			new_metadata: mem::take(&mut self.new_metadata),
			logs_update,
			spans_update,
		};

		self.watchers
			.retain(|watcher| watcher.tx.try_send(Ok(update.clone())).is_ok());
	}
}

pub struct TimeAnchor {
	mono: Instant,
	sys: SystemTime,
}

impl TimeAnchor {
	pub fn new() -> Self {
		Self {
			mono: Instant::now(),
			sys: SystemTime::now(),
		}
	}

	pub fn to_system_time(&self, t: Instant) -> SystemTime {
		let dur = t
			.checked_duration_since(self.mono)
			.unwrap_or_else(|| Duration::from_secs(0));
		self.sys + dur
	}

	pub fn to_timestamp(&self, t: Instant) -> prost_types::Timestamp {
		self.to_system_time(t).into()
	}
}
