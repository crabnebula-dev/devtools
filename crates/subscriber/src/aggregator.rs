use crate::{
    id_map::IdMap, stats, util::TimeAnchor, Command, Event, Include, Shared, ToProto, Unsent, Watch,
};
use futures_util::FutureExt;
use std::{
    mem,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    time::{Duration, Instant},
};
use tokio::sync::{mpsc, Notify};
use wire::instrument::Interests;

pub(crate) struct Aggregator {
    shared: Arc<Shared>,
    events: mpsc::Receiver<Event>,
    commands: mpsc::Receiver<Command>,
    /// Used to anchor monotonic timestamps to a base `SystemTime`, to produce a
    /// timestamp that can be sent over the wire.
    base_time: TimeAnchor,

    /// Which sources should be tracked
    /// enabled: Sources,
    watchers: Vec<Watch<wire::instrument::Update>>,

    /// *All* metadata for task spans and user-defined spans that we care about.
    ///
    /// This is sent to new clients as part of the initial state.
    all_metadata: Vec<wire::register_metadata::NewMetadata>,

    /// *New* metadata that was registered since the last state update.
    ///
    /// This is emptied on every state update.
    new_metadata: Vec<wire::register_metadata::NewMetadata>,

    log_events: Vec<wire::log::Event>,

    ipc_requests: IdMap<IPCRequest>,
    ipc_request_stats: IdMap<Arc<stats::IPCRequestStats>>,
}

#[derive(Debug, Default)]
pub struct Flush {
    should_flush: Notify,
    triggered: AtomicBool,
}

struct IPCRequest {
    id: tracing_core::span::Id,
    is_dirty: AtomicBool,
    metadata: &'static tracing_core::Metadata<'static>,
    cmd: String,
    kind: wire::ipc::request::Kind,
    fields: Vec<wire::Field>,
    handler: Option<wire::Location>,
}

impl Aggregator {
    pub fn new(
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
            ipc_requests: IdMap::new(),
            ipc_request_stats: IdMap::new(),
        }
    }

    pub async fn run(mut self, publish_interval: Duration) -> crate::Result<()> {
        let mut interval = tokio::time::interval(publish_interval);

        loop {
            let should_publish = tokio::select! {
                _ = interval.tick() => true,
                _ = self.shared.flush.should_flush.notified() => {
                    tracing::debug!("approaching capacity; draining buffer");

                    false
                },
                cmd = self.commands.recv() => {
                    match cmd {
                        Some(Command::Instrument(watcher)) => {
                            self.add_instrument_watcher(watcher)
                        },
                        None => {
                            tracing::debug!("rpc channel closed, terminating");
                            return Ok(());
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
                        return Ok(());
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

    fn add_instrument_watcher(&mut self, watcher: Watch<wire::instrument::Update>) {
        let now = Instant::now();

        let new_metadata = Some(wire::RegisterMetadata {
            metadata: self.all_metadata.clone(),
        });

        let ipc_update = watcher
            .interests
            .contains(Interests::Ipc)
            .then(|| self.ipc_update(Include::All));

        let log_update = watcher
            .interests
            .contains(Interests::Log)
            .then(|| self.log_update(Include::All));

        let update = wire::instrument::Update {
            now: Some(self.base_time.to_timestamp(now)),
            new_metadata,
            ipc_update,
            log_update,
        };

        // Send the initial state --- if this fails, the watcher is already dead
        if watcher.update(&update) {
            self.watchers.push(watcher);
        }
    }

    fn update_state(&mut self, event: Event) {
        match event {
            Event::Metadata(meta) => {
                self.all_metadata.push(meta.into());
                self.new_metadata.push(meta.into());
            }
            Event::LogEvent {
                metadata,
                fields,
                at,
            } => self.log_events.push(wire::log::Event {
                metadata_id: Some(metadata.into()),
                fields,
                at: Some(self.base_time.to_timestamp(at)),
            }),
            Event::IPCRequestInitiated {
                id,
                cmd,
                kind,
                metadata,
                fields,
                handler,
                stats,
            } => {
                self.ipc_requests.insert(
                    id.clone(),
                    IPCRequest {
                        id: id.clone(),
                        is_dirty: AtomicBool::new(true),
                        cmd,
                        metadata,
                        fields,
                        kind,
                        handler: Some(handler),
                    },
                );

                self.ipc_request_stats.insert(id, stats);
            }
        }
    }

    fn publish(&mut self) {
        let now = Instant::now();

        let new_metadata = if !self.new_metadata.is_empty() {
            Some(wire::RegisterMetadata {
                metadata: mem::take(&mut self.new_metadata),
            })
        } else {
            None
        };

        let ipc_update = if self.ipc_requests.has_unsent() || self.ipc_request_stats.has_unsent() {
            Some(self.ipc_update(Include::UpdateOnly))
        } else {
            None
        };

        let log_update = if !self.new_metadata.is_empty() {
            Some(self.log_update(Include::UpdateOnly))
        } else {
            None
        };

        let update = wire::instrument::Update {
            now: Some(self.base_time.to_timestamp(now)),
            new_metadata,
            ipc_update,
            log_update,
        };

        self.watchers.retain(|watcher| watcher.update(&update));
        self.watchers.shrink_to_fit();
    }

    fn ipc_update(&self, include: Include) -> wire::ipc::Update {
        wire::ipc::Update {
            new_requests: self.ipc_requests.to_proto_list(include, &self.base_time),
            stats_update: self
                .ipc_request_stats
                .to_proto_map(include, &self.base_time),
            dropped_events: match include {
                Include::All => self.shared.dropped_ipc_events.load(Ordering::Acquire) as u64,
                Include::UpdateOnly => {
                    self.shared.dropped_ipc_events.swap(0, Ordering::AcqRel) as u64
                }
            },
        }
    }

    fn log_update(&mut self, include: Include) -> wire::log::Update {
        match include {
            Include::All => wire::log::Update {
                new_events: self.log_events.clone(),
                dropped_events: self.shared.dropped_log_events.load(Ordering::Acquire) as u64,
            },
            Include::UpdateOnly => wire::log::Update {
                new_events: mem::take(&mut self.log_events),
                dropped_events: self.shared.dropped_ipc_events.swap(0, Ordering::AcqRel) as u64,
            },
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

impl Unsent for IPCRequest {
    fn take_unsent(&self) -> bool {
        self.is_dirty.swap(false, Ordering::AcqRel)
    }

    fn is_unsent(&self) -> bool {
        self.is_dirty.load(Ordering::Acquire)
    }
}

impl ToProto for IPCRequest {
    type Output = wire::ipc::Request;

    fn to_proto(&self, _base_time: &TimeAnchor) -> Self::Output {
        wire::ipc::Request {
            id: Some(self.id.clone().into()),
            cmd: self.cmd.clone(),
            metadata: Some(self.metadata.into()),
            fields: self.fields.clone(),
            kind: self.kind as i32,
            handler: self.handler.clone(),
        }
    }
}
