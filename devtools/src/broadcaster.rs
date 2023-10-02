use crate::{CloseSpan, Command, EnterSpan, Event, ExitSpan, LogEvent, NewSpan, Watcher};
use futures::FutureExt;
use std::collections::HashMap;
use std::mem;
use std::time::{Duration, Instant, SystemTime};
use tauri_devtools_wire_format as wire;
use tauri_devtools_wire_format::instrument::Filterable;
use tokio::sync::mpsc;

/// The interval for broadcasting logs and spans.
const BROADCAST_INTERVAL: Duration = Duration::from_millis(400); // TODO find good value for this

/// Broadcaster acts as the central component of the app instrumentation
///
/// It receives raw [`Event`]s from the [`Layer`], preprocesses them and relays them to all attached `watchers` through the [`Server`].
/// It can also receive [`Command`]s from the [`Server`] which control the behaviour of the broadcaster.
pub(crate) struct Broadcaster {
	events: mpsc::Receiver<Event>,
	cmds: mpsc::Receiver<Command>,

	watchers: Vec<Watcher>,

	new_metadata: HashMap<wire::MetaId, wire::Metadata>,

	new_logs: Vec<wire::logs::LogEvent>,
	new_spans: Vec<wire::spans::SpanEvent>,

	base_time: TimeAnchor,
}

impl Broadcaster {
	pub fn new(events: mpsc::Receiver<Event>, cmds: mpsc::Receiver<Command>) -> Self {
		Self {
			events,
			cmds,
			watchers: vec![],
			new_logs: vec![],
			new_spans: vec![],
			new_metadata: HashMap::new(),
			base_time: TimeAnchor::new(),
		}
	}
	pub async fn run(mut self) -> Self {
		let mut interval = tokio::time::interval(BROADCAST_INTERVAL);

		loop {
			let should_broadcast = tokio::select! {
				// Handle interval ticks.
				_ = interval.tick() => true,
				cmd = self.cmds.recv() => {
					match cmd {
						Some(Command::Instrument(watcher)) => {
							self.add_instrument_watcher(watcher);
						}
						None => {
							tracing::debug!("gRPC server closed, terminating...");
							// TODO set health status to NOT_SERVING?
							break;
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
						tracing::debug!("Event channel closed; terminating...");
						// TODO set health status to NOT_SERVING
						break;
					}
				};
			}

			if should_broadcast {
				self.broadcast();
			}
		}

		// attempt to flush updates to all watchers before closing
		self.broadcast();
		self
	}

	fn add_instrument_watcher(&mut self, watcher: Watcher) {
		// TODO send initial update
		self.watchers.push(watcher);
	}

	/// Takes in a Tree and pushes it to the internal queues of the broadcaster
	fn update_state(&mut self, event: Event) {
		match event {
			Event::Metadata(meta) => {
				self.new_metadata.insert(meta.into(), meta.into());
			}
			// Received a new log (event)
			Event::LogEvent(LogEvent {
				at,
				metadata,
				message,
				fields,
				maybe_parent,
			}) => {
				self.new_logs.push(wire::logs::LogEvent {
					at: Some(self.base_time.to_timestamp(at)),
					metadata_id: Some(metadata.into()),
					message,
					fields,
					parent: maybe_parent.map(|id| id.into()),
				});
			}
			Event::NewSpan(NewSpan {
				at,
				id,
				metadata,
				fields,
				maybe_parent,
			}) => self.new_spans.push(wire::spans::SpanEvent::new_span(
				self.base_time.to_timestamp(at),
				id,
				metadata,
				fields,
				maybe_parent,
			)),
			Event::EnterSpan(EnterSpan { at, span_id, thread_id }) => self.new_spans.push(
				wire::spans::SpanEvent::enter_span(self.base_time.to_timestamp(at), span_id, thread_id),
			),
			Event::ExitSpan(ExitSpan { at, span_id, thread_id }) => self.new_spans.push(
				wire::spans::SpanEvent::exit_span(self.base_time.to_timestamp(at), span_id, thread_id),
			),
			Event::CloseSpan(CloseSpan { at, span_id }) => self.new_spans.push(wire::spans::SpanEvent::close_span(
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
		let now = Instant::now();
		let logs_update = (!self.new_logs.is_empty()).then(|| self.logs_update());
		let spans_update = (!self.new_spans.is_empty()).then(|| self.spans_update());

		let new_metadata = mem::take(&mut self.new_metadata);

		self.watchers.retain(|watcher| {
			let mut logs_update = logs_update.clone();
			if let (Some(logs_update), Some(filter)) = (&mut logs_update, &watcher.log_filter) {
				logs_update.log_events.retain(|log_event| {
					let meta = new_metadata.get(&log_event.metadata_id.as_ref().unwrap()).unwrap();
					log_event.match_filter(meta, &filter)
				})
			};

			let update = wire::instrument::Update {
				at: Some(self.base_time.to_timestamp(now)),
				new_metadata: new_metadata // TODO this isn't ideal
					.clone()
					.into_iter()
					.map(|(id, metadata)| wire::NewMetadata {
						id: Some(id.into()),
						metadata: Some(metadata),
					})
					.collect(),
				logs_update,
				spans_update: spans_update.clone(),
			};

			let res = watcher.tx.try_send(Ok(update));
			if let Err(err) = &res {
				tracing::warn!("Failed to send update to client because of error {err:?}, removing from watchers...");
			}
			res.is_ok()
		});
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

#[cfg(test)]
mod test {
	use super::*;
	use crate::layer::Layer;
	use tauri_devtools_wire_format::instrument::Update;
	use tokio::sync::mpsc;
	use tracing_subscriber::prelude::*;

	async fn drain_updates(mf: Broadcaster, cmd_tx: mpsc::Sender<Command>) -> Vec<Update> {
		let (client_tx, mut client_rx) = mpsc::channel(1);
		cmd_tx
			.send(Command::Instrument(Watcher {
				log_filter: None,
				span_filter: None,
				tx: client_tx,
			}))
			.await
			.unwrap();
		drop(cmd_tx);

		mf.run().await; // run the broadcasters event loop to completion

		println!("done");

		let mut out = Vec::new();
		while let Some(Ok(update)) = client_rx.recv().await {
			out.push(update);
		}
		out
	}

	#[tokio::test]
	async fn attach_watcher() {
		let (_, evt_rx) = mpsc::channel(1);
		let (cmd_tx, cmd_rx) = mpsc::channel(1);

		let mf = Broadcaster::new(evt_rx, cmd_rx);

		let (client_tx, _) = mpsc::channel(1);
		cmd_tx
			.send(Command::Instrument(Watcher {
				log_filter: None,
				span_filter: None,
				tx: client_tx,
			}))
			.await
			.unwrap();
		drop(cmd_tx); // drop the cmd_tx connection here, this will stop the broadcaster

		let mf = mf.run().await;

		assert_eq!(mf.watchers.len(), 1);
	}

	#[tokio::test]
	async fn log_events() {
		let (evt_tx, evt_rx) = mpsc::channel(1);
		let (cmd_tx, cmd_rx) = mpsc::channel(1);

		let mf = Broadcaster::new(evt_rx, cmd_rx);
		let layer = Layer::new(evt_tx);

		tracing_subscriber::registry().with(layer).set_default();

		tracing::debug!("an event!");

		let updates = drain_updates(mf, cmd_tx).await;
		assert_eq!(updates.len(), 1);
	}
}
