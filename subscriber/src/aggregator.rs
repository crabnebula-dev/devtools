use std::{
    mem,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    time::{Duration, Instant},
};

use api::instrument::Interests;
use futures::FutureExt;
use tokio::sync::{mpsc, Notify};

use crate::{util::TimeAnchor, Command, Event, Include, Shared, Watch};

pub struct Aggregator {
    events: mpsc::Receiver<Event>,
    commands: mpsc::Receiver<Command>,
    shared: Arc<Shared>,

    /// Which sources should be tracked
    /// enabled: Sources,
    watchers: Vec<Watch<api::instrument::Update>>,

    /// *All* metadata for task spans and user-defined spans that we care about.
    ///
    /// This is sent to new clients as part of the initial state.
    all_metadata: Vec<api::register_metadata::NewMetadata>,

    /// *New* metadata that was registered since the last state update.
    ///
    /// This is emptied on every state update.
    new_metadata: Vec<api::register_metadata::NewMetadata>,

    log_events: Vec<api::log::Event>,

    /// Used to anchor monotonic timestamps to a base `SystemTime`, to produce a
    /// timestamp that can be sent over the wire.
    base_time: TimeAnchor,
}

#[derive(Debug, Default)]
pub struct Flush {
    should_flush: Notify,
    triggered: AtomicBool,
}

impl Aggregator {
    /// Default frequency for publishing events to clients.
    const DEFAULT_PUBLISH_INTERVAL: Duration = Duration::from_millis(250);

    pub(crate) fn new(
        shared: Arc<Shared>,
        events: mpsc::Receiver<Event>,
        commands: mpsc::Receiver<Command>,
    ) -> Self {
        Self {
            shared,
            events,
            commands,
            base_time: TimeAnchor::new(),
            watchers: Vec::new(),
            all_metadata: Vec::new(),
            new_metadata: Vec::new(),
            log_events: Vec::new(),
        }
    }

    pub async fn run(mut self) {
        let mut interval = tokio::time::interval(Self::DEFAULT_PUBLISH_INTERVAL);

        loop {
            let should_publish = tokio::select! {
                _ = interval.tick() => true,

                _ = self.shared.flush.should_flush.notified() => {
                    tracing::debug!("approaching capacity; draining buffer");

                    false
                }

                cmd = self.commands.recv() => {
                    match cmd {
                        Some(Command::Instrument(watcher)) => {
                            self.add_instrument_watcher(watcher)
                        },
                        None => {
                            tracing::debug!("rpc channel closed, terminating");
                            return;
                        },
                    };

                    false
                }
            };

            let mut drained = false;
            while let Some(event) = self.events.recv().now_or_never() {
                match event {
                    Some(event) => {
                        self.update_state(event);
                        drained = true;
                    }
                    // The channel closed, no more events will be emitted...time
                    // to stop aggregating.
                    None => {
                        tracing::debug!("event channel closed; terminating");
                        return;
                    }
                };
            }

            // flush data to clients, if there are any currently subscribed
            // watchers and we should send a new update.
            if !self.watchers.is_empty() && should_publish {
                self.publish();
            }
            // self.cleanup_closed();
            if drained {
                self.shared.flush.has_flushed();
            }
        }
    }

    fn add_instrument_watcher(&mut self, watcher: Watch<api::instrument::Update>) {
        tracing::debug!("new instrument watcher");

        let new_metadata =
            watcher
                .interests
                .contains(Interests::Metadata)
                .then_some(api::RegisterMetadata {
                    metadata: self.all_metadata.clone(),
                });

        let log_update = watcher
            .interests
            .contains(Interests::Trace)
            .then_some(self.log_update(Include::All));

        let now = Instant::now();

        let update = &api::instrument::Update {
            new_metadata,
            log_update,
            now: Some(self.base_time.to_timestamp(now)),
        };

        // Send the initial state --- if this fails, the watcher is already dead
        if watcher.update(update) {
            self.watchers.push(watcher);
            // self.enabled |= sources;
        }
    }

    fn update_state(&mut self, event: Event) {
        match event {
            Event::Metadata(meta) => {
                self.all_metadata.push(meta.into());
                self.new_metadata.push(meta.into());
            }
            Event::RequestSerialized => todo!(),
            Event::RequestInitiated => todo!(),
            Event::RequestSent => todo!(),
            Event::RequestReceived => todo!(),
            Event::RequestDeserialized => todo!(),
            Event::ResponseSerialized => todo!(),
            Event::ResponseSent => todo!(),
            Event::ResponseReceived => todo!(),
            Event::ResponseDeserialized => todo!(),
            Event::RequestCompleted => todo!(),
            Event::LogEvent {
                metadata,
                fields,
                at,
            } => self.log_events.push(api::log::Event {
                metadata_id: Some(metadata.into()),
                fields,
                at: Some(self.base_time.to_timestamp(at)),
            }),
        }
    }

    fn publish(&mut self) {
        let new_metadata = if !self.new_metadata.is_empty() {
            Some(api::RegisterMetadata {
                metadata: mem::take(&mut self.new_metadata),
            })
        } else {
            None
        };

        let log_update = if !self.log_events.is_empty() {
            Some(self.log_update(Include::Update))
        } else {
            None
        };

        let now = Instant::now();

        let update = &api::instrument::Update {
            now: Some(self.base_time.to_timestamp(now)),
            log_update,
            new_metadata,
        };

        self.watchers.retain(|watcher| watcher.update(update));
        self.watchers.shrink_to_fit();
    }

    fn log_update(&mut self, include: Include) -> api::log::LogUpdate {
        let new_events = match include {
            Include::All => self.log_events.clone(),
            Include::Update => mem::take(&mut self.log_events),
        };

        api::log::LogUpdate {
            new_events,
            dropped_events: self.shared.dropped_log_events.swap(0, Ordering::AcqRel) as u64,
        }
    }
}

impl Flush {
    pub fn trigger(&self) {
        if self
            .triggered
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .is_ok()
        {
            self.should_flush.notify_one();
        } else {
            // someone else already did it, that's fine...
        }
    }

    /// Indicates that the buffer has been successfully flushed.
    fn has_flushed(&self) {
        let _ = self
            .triggered
            .compare_exchange(true, false, Ordering::AcqRel, Ordering::Acquire);
    }
}
