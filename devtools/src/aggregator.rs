use crate::{Command, Event, Shared, Watcher};
use futures::FutureExt;
use ringbuf::consumer::Consumer;
use ringbuf::traits::{Observer, RingBuffer};
use ringbuf::LocalRb;
use std::mem;
use std::mem::MaybeUninit;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime};
use tauri_devtools_wire_format::logs::LogEvent;
use tauri_devtools_wire_format::spans::SpanEvent;
use tauri_devtools_wire_format::{instrument, logs, spans, NewMetadata};
use tokio::sync::mpsc;

const BROADCAST_INTERVAL: Duration = Duration::from_millis(400); // TODO find good value for this

pub(crate) struct Aggregator {
    shared: Arc<Shared>,
    events: mpsc::Receiver<Event>,
    cmds: mpsc::Receiver<Command>,

    /// All metadata entries that were ever registered
    /// This is fine to keep around bc there won't be many of them
    all_metadata: Vec<NewMetadata>,
    /// Metadata entries that were registered since the last update
    /// This is emptied on every update
    new_metadata: Vec<NewMetadata>,

    logs: EventBuf<LogEvent, 256>,
    spans: EventBuf<SpanEvent, 256>,

    watchers: Vec<Watcher>,

    base_time: TimeAnchor,
}

enum Include {
    All,
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

    pub async fn run(mut self) {
        let mut interval = tokio::time::interval(BROADCAST_INTERVAL);

        loop {
            let should_publish = tokio::select! {
                _ = interval.tick() => true,
                cmd = self.cmds.recv() => {
                    match cmd {
                        Some(Command::Instrument(watcher)) => {
                            self.attach_watcher(watcher).await;
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

            while let Some(event) = self.events.recv().now_or_never() {
                match event {
                    Some(event) => {
                        self.update_state(event);
                    }
                    None => {
                        tracing::debug!("event channel closed; terminating");
                        break;
                    }
                }
            }

            if should_publish {
                self.publish();
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
            Ok(_) => {
                self.watchers.push(watcher);
            }
            Err(err) => {
                tracing::warn!("Failed to send initial update to client because of error {err:?}")
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
                self.logs
                    .push_overwrite(&self.shared.dropped_log_events, || LogEvent {
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
            } => {
                self.spans
                    .push_overwrite(&self.shared.dropped_span_events, || {
                        SpanEvent::new_span(
                            self.base_time.to_timestamp(at),
                            id,
                            metadata,
                            fields,
                            maybe_parent,
                        )
                    });
            }
            Event::EnterSpan {
                at,
                span_id,
                thread_id,
            } => {
                self.spans
                    .push_overwrite(&self.shared.dropped_span_events, || {
                        SpanEvent::enter_span(self.base_time.to_timestamp(at), span_id, thread_id)
                    });
            }
            Event::ExitSpan {
                at,
                span_id,
                thread_id,
            } => {
                self.spans
                    .push_overwrite(&self.shared.dropped_span_events, || {
                        SpanEvent::exit_span(self.base_time.to_timestamp(at), span_id, thread_id)
                    });
            }
            Event::CloseSpan { at, span_id } => {
                self.spans
                    .push_overwrite(&self.shared.dropped_span_events, || {
                        SpanEvent::close_span(self.base_time.to_timestamp(at), span_id)
                    });
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

    async fn drain_updates(mf: Aggregator, cmd_tx: mpsc::Sender<Command>) -> Vec<Update> {
        let (client_tx, mut client_rx) = mpsc::channel(1);
        cmd_tx
            .send(Command::Instrument(Watcher { tx: client_tx }))
            .await
            .unwrap();
        drop(cmd_tx);

        mf.run().await; // run the aggregators event loop to completion

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

        let (maybe_update, _) = futures::join!(client_rx.recv(), mf.run());
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