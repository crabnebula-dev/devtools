use crate::{CloseSpan, Command, EnterSpan, Event, ExitSpan, LogEvent, NewSpan, Shared, Watcher};
use futures::FutureExt;
use ringbuf::traits::{Consumer, Observer, RingBuffer};
use ringbuf::LocalRb;
use std::collections::HashMap;
use std::mem;
use std::mem::MaybeUninit;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
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
	shared: Arc<Shared>,
	events: mpsc::Receiver<Event>,
	cmds: mpsc::Receiver<Command>,

	watchers: Vec<Watcher>,

	all_metadata: HashMap<wire::MetaId, wire::Metadata>,
	new_metadata: Vec<wire::NewMetadata>,

	logs: EventBuf<wire::logs::LogEvent, 256>,
	spans: EventBuf<wire::spans::SpanEvent, 256>,

	base_time: TimeAnchor,
}

enum UpdateKind {
	Full,
	Incremental,
}

impl Broadcaster {
	pub fn new(shared: Arc<Shared>, events: mpsc::Receiver<Event>, cmds: mpsc::Receiver<Command>) -> Self {
		Self {
			shared,
			events,
			cmds,
			watchers: vec![],
			logs: EventBuf::new(),
			spans: EventBuf::new(),
			all_metadata: HashMap::new(),
			new_metadata: vec![],
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
							self.add_instrument_watcher(watcher).await;
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

	async fn add_instrument_watcher(&mut self, watcher: Watcher) {
		let now = Instant::now();

		let new_metadata = self
			.all_metadata
			.clone()
			.into_iter()
			.map(|(id, metadata)| wire::NewMetadata {
				id: Some(id),
				metadata: Some(metadata),
			})
			.collect();

		let mut logs_update = self.logs_update(UpdateKind::Full).expect("Full updates are never None");
		let spans_update = self
			.spans_update(UpdateKind::Full)
			.expect("Full updates are never None");

		if let Some(filter) = &watcher.log_filter {
			logs_update.log_events.retain(|log_event| {
				let meta = self.all_metadata.get(log_event.metadata_id.as_ref().unwrap()).unwrap();
				log_event.match_filter(meta, filter)
			});
		};

		let update = wire::instrument::Update {
			at: Some(self.base_time.to_timestamp(now)),
			new_metadata,
			logs_update: Some(logs_update),
			spans_update: Some(spans_update),
		};

		match watcher.tx.send(Ok(update)).await {
			Ok(_) => self.watchers.push(watcher),
			Err(err) => tracing::warn!("Failed to send initial update to client because of error {err:?}"),
		}
	}

	/// Takes in a Tree and pushes it to the internal queues of the broadcaster
	fn update_state(&mut self, event: Event) {
		match event {
			Event::Metadata(meta) => {
				self.all_metadata.insert(meta.into(), meta.into());
				self.new_metadata.push(meta.into());
			}
			// Received a new log (event)
			Event::LogEvent(LogEvent {
				at,
				metadata,
				message,
				fields,
				maybe_parent,
			}) => {
				self.logs
					.push_overwrite(&self.shared.dropped_log_events, || wire::logs::LogEvent {
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
			}) => {
				self.spans.push_overwrite(&self.shared.dropped_span_events, || {
					wire::spans::SpanEvent::new_span(
						self.base_time.to_timestamp(at),
						id,
						metadata,
						fields,
						maybe_parent,
					)
				});
			}
			Event::EnterSpan(EnterSpan { at, span_id, thread_id }) => {
				self.spans.push_overwrite(&self.shared.dropped_span_events, || {
					wire::spans::SpanEvent::enter_span(self.base_time.to_timestamp(at), span_id, thread_id)
				});
			}
			Event::ExitSpan(ExitSpan { at, span_id, thread_id }) => {
				self.spans.push_overwrite(&self.shared.dropped_span_events, || {
					wire::spans::SpanEvent::exit_span(self.base_time.to_timestamp(at), span_id, thread_id)
				});
			}
			Event::CloseSpan(CloseSpan { at, span_id }) => {
				self.spans.push_overwrite(&self.shared.dropped_span_events, || {
					wire::spans::SpanEvent::close_span(self.base_time.to_timestamp(at), span_id)
				});
			}
		}
	}
	fn logs_update(&mut self, kind: UpdateKind) -> Option<wire::logs::Update> {
		let log_events = match kind {
			UpdateKind::Full => self.logs.iter().cloned().collect(),
			UpdateKind::Incremental => self.logs.take_unsent().cloned().collect(),
		};

		let dropped_events = match kind {
			UpdateKind::Full => self.shared.dropped_log_events.load(Ordering::Acquire) as u64,
			UpdateKind::Incremental => self.shared.dropped_log_events.swap(0, Ordering::AcqRel) as u64,
		};

		Some(wire::logs::Update {
			log_events,
			dropped_events,
		})
	}

	fn spans_update(&mut self, kind: UpdateKind) -> Option<wire::spans::Update> {
		let span_events = match kind {
			UpdateKind::Full => self.spans.iter().cloned().collect(),
			UpdateKind::Incremental => self.spans.take_unsent().cloned().collect(),
		};

		let dropped_events = match kind {
			UpdateKind::Full => self.shared.dropped_span_events.load(Ordering::Acquire) as u64,
			UpdateKind::Incremental => self.shared.dropped_span_events.swap(0, Ordering::AcqRel) as u64,
		};

		Some(wire::spans::Update {
			span_events,
			dropped_events,
		})
	}

	/// Broadcasts new log or span events to the outbound channels if necessary
	fn broadcast(&mut self) {
		let now = Instant::now();

		let new_metadata = mem::take(&mut self.new_metadata);

		let logs_update = self.logs_update(UpdateKind::Incremental);
		let spans_update = self.spans_update(UpdateKind::Incremental);

		self.watchers.retain(|watcher| {
			let mut logs_update = logs_update.clone();
			if let (Some(logs_update), Some(filter)) = (&mut logs_update, &watcher.log_filter) {
				logs_update.log_events.retain(|log_event| {
					let meta = self.all_metadata.get(log_event.metadata_id.as_ref().unwrap()).unwrap();
					log_event.match_filter(meta, filter)
				})
			};

			let update = wire::instrument::Update {
				at: Some(self.base_time.to_timestamp(now)),
				new_metadata: new_metadata.clone(),
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

struct EventBuf<T, const CAP: usize> {
	inner: LocalRb<[MaybeUninit<T>; CAP]>,
	sent: usize,
}

impl<T, const CAP: usize> EventBuf<T, CAP> {
	pub fn new() -> Self {
		Self {
			inner: LocalRb::default(),
			sent: 0,
		}
	}

	pub fn push_overwrite(&mut self, dropped: &AtomicUsize, mk_item: impl FnOnce() -> T) {
		if self.inner.push_overwrite(mk_item()).is_some() {
			dropped.fetch_add(1, Ordering::Release);
			self.sent -= 1;
		}
	}

	pub fn take_unsent(&mut self) -> impl Iterator<Item = &T> {
		let iter = self.inner.iter().skip(self.sent);
		self.sent = self.inner.occupied_len();
		iter
	}

	pub fn iter(&self) -> impl Iterator<Item = &T> {
		self.inner.iter()
	}
}

#[cfg(test)]
mod test {
	use super::*;
	use crate::layer::Layer;
	use tauri_devtools_wire_format::instrument::Update;
	use tokio::sync::mpsc;
	use tracing_subscriber::prelude::*;

	#[test]
	fn ringbuf() {
		let mut buf: EventBuf<u8, 5> = EventBuf::new();
		let dropped = AtomicUsize::new(0);

		buf.push_overwrite(&dropped, || 1);
		let one: Vec<_> = buf.take_unsent().copied().collect();

		buf.push_overwrite(&dropped, || 2);
		buf.push_overwrite(&dropped, || 3);
		buf.push_overwrite(&dropped, || 4);
		let two: Vec<_> = buf.take_unsent().copied().collect();

		buf.push_overwrite(&dropped, || 5);
		buf.push_overwrite(&dropped, || 6);
		let three: Vec<_> = buf.take_unsent().copied().collect();

		assert_eq!(one, [1]);
		assert_eq!(two, [2, 3, 4]);
		assert_eq!(three, [5, 6]);
		assert_eq!(dropped.load(Ordering::Acquire), 1);
	}

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

		let mf = Broadcaster::new(Default::default(), evt_rx, cmd_rx);

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
		let shared = Arc::new(Shared::default());
		let (evt_tx, evt_rx) = mpsc::channel(1);
		let (cmd_tx, cmd_rx) = mpsc::channel(1);

		let layer = Layer::new(shared.clone(), evt_tx);
		let mf = Broadcaster::new(shared, evt_rx, cmd_rx);

		tracing_subscriber::registry().with(layer).set_default();

		tracing::debug!("an event!");

		let updates = drain_updates(mf, cmd_tx).await;
		assert_eq!(updates.len(), 1);
	}
}
