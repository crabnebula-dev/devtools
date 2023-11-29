use crate::{Command, Event, Shared, Watcher};
use futures::sink::drain;
use futures::FutureExt;
use ringbuf::consumer::Consumer;
use ringbuf::traits::{Observer, RingBuffer};
use ringbuf::HeapRb;
use std::mem;
use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime};
use tauri_devtools_wire_format::logs::LogEvent;
use tauri_devtools_wire_format::spans::SpanEvent;
use tauri_devtools_wire_format::{instrument, logs, spans, NewMetadata};
use tokio::sync::mpsc;

/// The event aggregator
///
/// This is the heart of the instrumentation, it receives events from the
/// [`Layer`], does light pre-processing, buffers them up into `Update`s and
/// send these to all subscribed clients.
pub(crate) struct Aggregator {
    /// Data shared with the [`Layer`]
    shared: Arc<Shared>,
    /// Channel of events from the [`Layer`]
    events: mpsc::Receiver<Event>,
    /// Channel of commands from the gRPC server
    cmds: mpsc::Receiver<Command>,

    /// All metadata entries that were ever registered
    /// This is fine to keep around bc there won't be many of them
    all_metadata: Vec<NewMetadata>,
    /// Metadata entries that were registered since the last update
    /// This is emptied on every update
    new_metadata: Vec<NewMetadata>,

    /// Buffered log events.
    /// Up to 256 events are retained before the oldest will be dropped.
    logs: EventBuf<LogEvent, 512>,
    /// Buffered span events.
    /// Up to 256 events are retained before the oldest will be dropped.
    spans: EventBuf<SpanEvent, 512>,

    /// All connected clients
    watchers: Vec<Watcher>,

    /// Used to convert `Instant`s to `SystemTime`s and `Timestamp`s
    pub(crate) base_time: TimeAnchor,
}

/// Whether to include all buffered events or only those that were buffered since the last update
#[derive(Debug, Copy, Clone)]
enum Include {
    /// Include all buffered events
    All,
    /// Include only events that were buffered since the last update
    IncrementalOnly,
}

impl Aggregator {
    pub fn new(
        shared: Arc<Shared>,
        events: mpsc::Receiver<Event>,
        cmds: mpsc::Receiver<Command>,
    ) -> Self {
        Self {
            shared,
            events,
            cmds,
            watchers: vec![],
            logs: EventBuf::new(),
            spans: EventBuf::new(),
            all_metadata: vec![],
            new_metadata: vec![],
            base_time: TimeAnchor::new(),
        }
    }

    pub async fn run(mut self, publish_interval: Duration) {
        let mut interval = tokio::time::interval(publish_interval);

        loop {
            let (should_publish, aggressive) = tokio::select! {
                _ = interval.tick() => (true, false),
                _ = self.shared.flush.notify.notified() => {
                    tracing::debug!("event buffer approaching capacity, flushing...");
                    (false, true)
                },
                cmd = self.cmds.recv() => {
                    if let Some(Command::Instrument(watcher)) = cmd {
                        self.attach_watcher(watcher).await;
                    } else {
                        tracing::debug!("gRPC server closed, terminating...");
                        // TODO set health status to NOT_SERVING?
                        break;
                    }

                    (false, false)
                }
            };

            let mut drained = false;
            let mut count = 0;

            if aggressive {
                tracing::debug!("agressive flushing");
                while let Some(event) = tokio::select! {
                    e = self.events.recv() => e,
                    _ = interval.tick() => None,
                } {
                    count += 1;
                    self.update_state(event);
                    drained = true;
                }
            } else {
                while let Some(event) = self.events.recv().now_or_never() {
                    count += 1;
                    if let Some(event) = event {
                        self.update_state(event);
                        drained = true;
                    } else {
                        tracing::debug!("event channel closed; terminating");
                        break;
                    }
                }
            }

            tracing::debug!("flushed {count} event, drained {drained}");

            if should_publish {
                self.publish();
            }

            if drained {
                self.shared.flush.has_flushed();
            }
        }

        // attempt to flush updates to all watchers before closing
        self.publish();
    }

    async fn attach_watcher(&mut self, watcher: Watcher) {
        let now = Instant::now();

        let log_update = self.log_update(Include::All);
        let span_update = self.span_update(Include::All);

        let update = instrument::Update {
            at: Some(self.base_time.to_timestamp(now)),
            new_metadata: self.all_metadata.clone(),
            logs_update: Some(log_update),
            spans_update: Some(span_update),
        };

        match watcher.tx.send(Ok(update)).await {
            Ok(()) => {
                self.watchers.push(watcher);
            }
            Err(err) => {
                tracing::warn!("Failed to send initial update to client because of error {err:?}");
            }
        }
    }

    fn update_state(&mut self, event: Event) {
        match event {
            Event::Metadata(metadata) => {
                self.all_metadata.push(metadata.into());
                self.new_metadata.push(metadata.into());
            }
            Event::Event {
                at,
                metadata,
                message,
                fields,
                maybe_parent,
            } => {
                self.logs.push_overwrite(LogEvent {
                    at: Some(self.base_time.to_timestamp(at)),
                    metadata_id: metadata as *const _ as u64,
                    message,
                    fields,
                    parent: maybe_parent.map(|id| id.into_u64()),
                });
            }
            Event::NewSpan {
                at,
                id,
                metadata,
                fields,
                maybe_parent,
            } => {
                self.spans.push_overwrite(SpanEvent::new_span(
                    self.base_time.to_timestamp(at),
                    &id,
                    metadata,
                    fields,
                    maybe_parent,
                ));
            }
            Event::EnterSpan {
                at,
                span_id,
                thread_id,
            } => {
                self.spans.push_overwrite(SpanEvent::enter_span(
                    self.base_time.to_timestamp(at),
                    &span_id,
                    thread_id,
                ));
            }
            Event::ExitSpan {
                at,
                span_id,
                thread_id,
            } => {
                self.spans.push_overwrite(SpanEvent::exit_span(
                    self.base_time.to_timestamp(at),
                    &span_id,
                    thread_id,
                ));
            }
            Event::CloseSpan { at, span_id } => {
                self.spans.push_overwrite(SpanEvent::close_span(
                    self.base_time.to_timestamp(at),
                    &span_id,
                ));
            }
        }
    }

    fn log_update(&mut self, include: Include) -> logs::Update {
        let log_events = match include {
            Include::All => self.logs.iter().cloned().collect(),
            Include::IncrementalOnly => self.logs.take_unsent().cloned().collect(),
        };

        let dropped_events = match include {
            Include::All => self.shared.dropped_log_events.load(Ordering::Acquire) as u64,
            Include::IncrementalOnly => {
                self.shared.dropped_log_events.swap(0, Ordering::AcqRel) as u64
            }
        };

        tracing::debug!("dropped log events {dropped_events}");

        logs::Update {
            log_events,
            dropped_events,
        }
    }

    fn span_update(&mut self, include: Include) -> spans::Update {
        let span_events = match include {
            Include::All => self.spans.iter().cloned().collect(),
            Include::IncrementalOnly => self.spans.take_unsent().cloned().collect(),
        };

        let dropped_events = match include {
            Include::All => self.shared.dropped_span_events.load(Ordering::Acquire) as u64,
            Include::IncrementalOnly => {
                self.shared.dropped_span_events.swap(0, Ordering::AcqRel) as u64
            }
        };

        tracing::debug!("dropped span events {dropped_events}");

        spans::Update {
            span_events,
            dropped_events,
        }
    }

    fn publish(&mut self) {
        let now = Instant::now();

        let new_metadata = mem::take(&mut self.new_metadata);
        let log_update = self.log_update(Include::IncrementalOnly);
        let span_update = self.span_update(Include::IncrementalOnly);

        let update = instrument::Update {
            at: Some(self.base_time.to_timestamp(now)),
            new_metadata,
            logs_update: Some(log_update),
            spans_update: Some(span_update),
        };

        self.watchers
            .retain(|w| w.tx.try_send(Ok(update.clone())).is_ok());
    }
}

/// Used to convert `Instant`s to `SystemTime`s and `Timestamp`s
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

/// A fixed-size buffer for events
///
/// This is essentially a FIFO queue, that will discard the oldest item when full.
///
/// It also keeps a counter of how many events in the buffer were sent to clients.
/// [`EventBuf::take_unsent`] will return all events that were not sent yet and reset the counter.
struct EventBuf<T, const CAP: usize> {
    inner: HeapRb<T>,
    sent: usize,
}

impl<T, const CAP: usize> EventBuf<T, CAP> {
    pub fn new() -> Self {
        Self {
            inner: HeapRb::new(CAP),
            sent: 0,
        }
    }

    /// Push an event into the buffer, overwriting the oldest event if the buffer is full.
    // TODO does it really make sense to track the dropped events here?
    pub fn push_overwrite(&mut self, item: T) {
        if self.inner.push_overwrite(item).is_some() {
            self.sent = self.sent.saturating_sub(1);
        }
    }

    /// Returns an iterator over all events that were not sent yet.
    pub fn take_unsent(&mut self) -> impl Iterator<Item = &T> {
        let iter = self.inner.iter().skip(self.sent);
        self.sent = self.inner.occupied_len();
        iter
    }

    /// Returns an iterator over all events in the buffer.
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

        buf.push_overwrite(1);
        let one: Vec<_> = buf.take_unsent().copied().collect();

        buf.push_overwrite(2);
        buf.push_overwrite(3);
        buf.push_overwrite(4);
        let two: Vec<_> = buf.take_unsent().copied().collect();

        buf.push_overwrite(5);
        buf.push_overwrite(6);
        let three: Vec<_> = buf.take_unsent().copied().collect();

        assert_eq!(one, [1]);
        assert_eq!(two, [2, 3, 4]);
        assert_eq!(three, [5, 6]);
    }

    async fn drain_updates(mf: Aggregator, cmd_tx: mpsc::Sender<Command>) -> Vec<Update> {
        let (client_tx, mut client_rx) = mpsc::channel(1);
        cmd_tx
            .send(Command::Instrument(Watcher { tx: client_tx }))
            .await
            .unwrap();
        drop(cmd_tx);

        mf.run(Duration::from_millis(10)).await; // run the aggregators event loop to completion

        let mut out = Vec::new();
        while let Some(Ok(update)) = client_rx.recv().await {
            out.push(update);
        }
        out
    }

    #[tokio::test]
    async fn initial_update() {
        let (_, evt_rx) = mpsc::channel(1);
        let (cmd_tx, cmd_rx) = mpsc::channel(1);

        let mf = Aggregator::new(Default::default(), evt_rx, cmd_rx);

        let (client_tx, mut client_rx) = mpsc::channel(1);
        cmd_tx
            .send(Command::Instrument(Watcher { tx: client_tx }))
            .await
            .unwrap();
        drop(cmd_tx); // drop the cmd_tx connection here, this will stop the aggregator

        let (maybe_update, _) = futures::join!(client_rx.recv(), mf.run(Duration::from_millis(10)));
        let update = maybe_update.unwrap().unwrap();
        assert_eq!(update.logs_update.unwrap().log_events.len(), 0);
        assert_eq!(update.spans_update.unwrap().span_events.len(), 0);
        assert_eq!(update.new_metadata.len(), 0);
    }

    #[tokio::test]
    async fn log_events() {
        let shared = Arc::new(Shared::default());
        let (evt_tx, evt_rx) = mpsc::channel(1);
        let (cmd_tx, cmd_rx) = mpsc::channel(1);

        let layer = Layer::new(shared.clone(), evt_tx);
        let mf = Aggregator::new(shared, evt_rx, cmd_rx);

        tracing_subscriber::registry().with(layer).set_default();

        tracing::debug!("an event!");

        let updates = drain_updates(mf, cmd_tx).await;
        assert_eq!(updates.len(), 1);
    }
}
