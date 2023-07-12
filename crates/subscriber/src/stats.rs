use crate::{ToProto, Unsent};
use parking_lot::Mutex;
use std::{
    sync::atomic::{AtomicBool, Ordering},
    time::{Duration, Instant},
};

#[derive(Debug)]
pub(crate) struct IPCRequestStats {
    is_dirty: AtomicBool,

    pub(crate) initiated_at: Instant,
    completed_at: Mutex<Option<Instant>>,

    deserialize_request: Mutex<Timestamps>,
    serialize_response: Mutex<Timestamps>,
    inner: Mutex<Timestamps>,
}

#[derive(Debug)]
struct Timestamps {
    first_enter: Option<Instant>,
    last_enter_started: Option<Instant>,
    last_enter_ended: Option<Instant>,
    busy_time: Duration,
    waiting_time: Duration,
}

impl IPCRequestStats {
    pub(crate) fn new(initiated_at: Instant) -> Self {
        Self {
            is_dirty: AtomicBool::new(true),
            initiated_at,
            completed_at: Mutex::new(None),
            // task_stats: TaskStats::new(poll_duration_max, scheduled_duration_max, initiated_at),
            deserialize_request: Mutex::new(Timestamps::new()),
            serialize_response: Mutex::new(Timestamps::new()),
            inner: Mutex::new(Timestamps::new()),
        }
    }

    pub(crate) fn start_deserialize(&self, at: Instant) {
        self.deserialize_request.lock().start_execution(at);
        self.make_dirty();
    }

    pub(crate) fn end_deserialize(&self, at: Instant) {
        self.deserialize_request.lock().stop_execution(at);
        self.make_dirty();
    }

    pub(crate) fn start_serialize(&self, at: Instant) {
        self.serialize_response.lock().start_execution(at);
        self.make_dirty();
    }

    pub(crate) fn end_serialize(&self, at: Instant) {
        self.serialize_response.lock().stop_execution(at);
        self.make_dirty();
    }

    pub(crate) fn start_inner(&self, at: Instant) {
        self.inner.lock().start_execution(at);
        self.make_dirty();
    }

    pub(crate) fn end_inner(&self, at: Instant) {
        self.inner.lock().stop_execution(at);
        self.make_dirty();
    }

    pub(crate) fn complete(&self, at: Instant) {
        *self.completed_at.lock() = Some(at);
        self.make_dirty();
    }

    #[inline]
    fn make_dirty(&self) {
        self.is_dirty.swap(true, Ordering::AcqRel);
    }
}

impl Timestamps {
    pub fn new() -> Self {
        Self {
            first_enter: None,
            last_enter_started: None,
            last_enter_ended: None,
            busy_time: Duration::ZERO,
            waiting_time: Duration::ZERO,
        }
    }
}

impl Unsent for IPCRequestStats {
    fn take_unsent(&self) -> bool {
        self.is_dirty.swap(false, Ordering::AcqRel)
    }

    fn is_unsent(&self) -> bool {
        self.is_dirty.load(Ordering::Acquire)
    }
}

impl ToProto for IPCRequestStats {
    type Output = wire::ipc::Stats;

    fn to_proto(&self, base_time: &crate::util::TimeAnchor) -> Self::Output {
        wire::ipc::Stats {
            initiated_at: Some(base_time.to_timestamp(self.initiated_at)),
            completed_at: self
                .completed_at
                .lock()
                .map(|t: Instant| base_time.to_timestamp(t)),
            deserialize_request: Some(self.deserialize_request.lock().to_proto(base_time)),
            serialize_reponse: Some(self.serialize_response.lock().to_proto(base_time)),
            inner: Some(self.inner.lock().to_proto(base_time)),
        }
    }
}

impl Timestamps {
    pub fn start_execution(&mut self, at: Instant) {
        if self.first_enter.is_none() {
            self.first_enter = Some(at)
        }

        self.last_enter_started = Some(at);

        if let Some(last_enter_ended) = self.last_enter_ended {
            let waiting = at.saturating_duration_since(last_enter_ended);

            self.waiting_time += waiting;
        }
    }

    pub fn stop_execution(&mut self, at: Instant) {
        let started = match self.last_enter_started {
            Some(last_poll) => last_poll,
            None => {
                eprintln!(
                    "a poll ended, but start timestamp was recorded. \
                     this is probably a `console-subscriber` bug"
                );
                return;
            }
        };

        self.last_enter_ended = Some(at);
        let busy = match at.checked_duration_since(started) {
            Some(elapsed) => elapsed,
            None => {
                eprintln!(
                    "possible Instant clock skew detected: a poll's end timestamp \
                    was before its start timestamp\nstart = {:?}\n  end = {:?}",
                    started, at
                );
                return;
            }
        };

        // self.busy_histogram.record_duration(busy);
        self.busy_time += busy;
    }
}

impl ToProto for Timestamps {
    type Output = wire::ipc::Timestamps;

    fn to_proto(&self, base_time: &crate::util::TimeAnchor) -> Self::Output {
        wire::ipc::Timestamps {
            first_enter: self.first_enter.map(|t| base_time.to_timestamp(t)),
            last_enter_started: self.last_enter_started.map(|t| base_time.to_timestamp(t)),
            last_enter_ended: self.last_enter_ended.map(|t| base_time.to_timestamp(t)),
            waiting_time: self.waiting_time.try_into().ok(),
            busy_time: self.busy_time.try_into().ok(),
        }
    }
}
