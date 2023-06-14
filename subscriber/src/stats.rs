use hdrhistogram::{
    self,
    serialization::{Serializer, V2Serializer},
};
use parking_lot::Mutex;
use std::{
    sync::atomic::{AtomicBool, Ordering},
    time::{Duration, Instant},
};

use crate::{ToProto, Unsent};

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
    busy_histogram: Histogram,
    waiting_histogram: Histogram,
}

#[derive(Debug)]
struct Histogram {
    histogram: hdrhistogram::Histogram<u64>,
    max: u64,
    outliers: u64,
    max_outlier: Option<u64>,
}

impl IPCRequestStats {
    pub(crate) fn new(
        busy_duration_max: u64,
        waiting_duration_max: u64,
        initiated_at: Instant,
    ) -> Self {
        Self {
            is_dirty: AtomicBool::new(true),
            initiated_at,
            completed_at: Mutex::new(None),
            // task_stats: TaskStats::new(poll_duration_max, scheduled_duration_max, initiated_at),
            deserialize_request: Mutex::new(Timestamps::new(
                busy_duration_max,
                waiting_duration_max,
            )),
            serialize_response: Mutex::new(Timestamps::new(
                busy_duration_max,
                waiting_duration_max,
            )),
            inner: Mutex::new(Timestamps::new(
                busy_duration_max,
                waiting_duration_max,
            )),
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
    pub fn new(busy_duration_max: u64, waiting_duration_max: u64) -> Self {
        Self {
            first_enter: None,
            last_enter_started: None,
            last_enter_ended: None,
            busy_time: Duration::ZERO,
            waiting_time: Duration::ZERO,
            busy_histogram: Histogram::new(busy_duration_max),
            waiting_histogram: Histogram::new(waiting_duration_max),
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
    type Output = api::ipc::Stats;

    fn to_proto(&self, base_time: &crate::util::TimeAnchor) -> Self::Output {
        api::ipc::Stats {
            initiated_at: Some(base_time.to_timestamp(self.initiated_at)),
            completed_at: self
                .completed_at
                .lock()
                .map(|t: Instant| base_time.to_timestamp(t)),
            deserialize_request: Some(self.deserialize_request.lock().to_proto(base_time)),
            serialize_reponse: Some(self.serialize_response.lock().to_proto(base_time)),
            inner: Some(self.inner.lock().to_proto(base_time)),
            task_stats: None,
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

            self.waiting_histogram.record_duration(waiting);

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

        self.busy_histogram.record_duration(busy);
        self.busy_time += busy;
    }
}

impl ToProto for Timestamps {
    type Output = api::ipc::Timestamps;

    fn to_proto(&self, base_time: &crate::util::TimeAnchor) -> Self::Output {
        api::ipc::Timestamps {
            first_enter: self.first_enter.map(|t| base_time.to_timestamp(t)),
            last_enter_started: self.last_enter_started.map(|t| base_time.to_timestamp(t)),
            last_enter_ended: self.last_enter_ended.map(|t| base_time.to_timestamp(t)),
            waiting_time: self.waiting_time.try_into().ok(),
            busy_time: self.busy_time.try_into().ok(),
            waiting_times_histogram: Some(self.waiting_histogram.to_proto(base_time)),
            busy_times_histogram: Some(self.busy_histogram.to_proto(base_time))
        }
    }
}

// impl TaskStats {
//     pub(crate) fn new(
//         poll_duration_max: u64,
//         scheduled_duration_max: u64,
//         created_at: Instant,
//     ) -> Self {
//         Self {
//             is_dirty: AtomicBool::new(true),
//             is_dropped: AtomicBool::new(false),
//             created_at,
//             dropped_at: Mutex::new(None),
//             wakes: AtomicUsize::new(0),
//             waker_clones: AtomicUsize::new(0),
//             waker_drops: AtomicUsize::new(0),
//             self_wakes: AtomicUsize::new(0),
//             poll_stats: PollStats {
//                 current_polls: AtomicUsize::new(0),
//                 polls: AtomicUsize::new(0),
//                 timestamps: Mutex::new(PollTimestamps {
//                     first_poll: None,
//                     last_wake: None,
//                     last_poll_started: None,
//                     last_poll_ended: None,
//                     busy_time: Duration::new(0, 0),
//                     scheduled_time: Duration::new(0, 0),
//                     poll_histogram: Histogram::new(poll_duration_max),
//                     scheduled_histogram: Histogram::new(scheduled_duration_max),
//                 }),
//             },
//         }
//     }

//     pub(crate) fn record_wake_op(&self, op: crate::WakeOp, at: Instant) {}

//     pub(crate) fn wake(&self, at: Instant, self_wake: bool) {
//         let mut timestamps = self.poll_stats.timestamps.lock();
//         timestamps.last_wake = std::cmp::max(timestamps.last_wake, Some(at));

//         self.wakes.fetch_add(1, Ordering::Release);
//         if self_wake {
//             self.self_wakes.fetch_add(1, Ordering::Release);
//         }

//         self.make_dirty();
//     }

//     pub(crate) fn start_poll(&self, at: Instant) {
//         if self.poll_stats.current_polls.fetch_add(1, Ordering::AcqRel) > 0 {
//             return;
//         }

//         // We are starting the first poll
//         let mut timestamps = self.poll_stats.timestamps.lock();
//         if timestamps.first_poll.is_none() {
//             timestamps.first_poll = Some(at);
//         }

//         timestamps.last_poll_started = Some(at);

//         self.poll_stats.polls.fetch_add(1, Ordering::Release);

//         // If the last poll ended after the last wake then it was likely
//         // a self-wake, so we measure from the end of the last poll instead.
//         // This also ensures that `busy_time` and `scheduled_time` don't overlap.
//         let scheduled = match std::cmp::max(timestamps.last_wake, timestamps.last_poll_ended) {
//             Some(scheduled) => scheduled,
//             None => return, // Async operations record polls, but not wakes
//         };

//         // `at < scheduled` is possible when a task switches threads between polls.
//         let elapsed = at.saturating_duration_since(scheduled);

//         // if we have a scheduled time histogram, add the timestamp
//         timestamps.scheduled_histogram.record_duration(elapsed);

//         timestamps.scheduled_time += elapsed;
//     }

//     pub(crate) fn end_poll(&self, at: Instant) {
//         if self.poll_stats.current_polls.fetch_add(1, Ordering::AcqRel) > 0 {
//             return;
//         }

//         // We are starting the first poll
//         let mut timestamps = self.poll_stats.timestamps.lock();
//         if timestamps.first_poll.is_none() {
//             timestamps.first_poll = Some(at);
//         }

//         timestamps.last_poll_started = Some(at);

//         self.poll_stats.polls.fetch_add(1, Ordering::Release);

//         // If the last poll ended after the last wake then it was likely
//         // a self-wake, so we measure from the end of the last poll instead.
//         // This also ensures that `busy_time` and `scheduled_time` don't overlap.
//         let scheduled = match std::cmp::max(timestamps.last_wake, timestamps.last_poll_ended) {
//             Some(scheduled) => scheduled,
//             None => return, // Async operations record polls, but not wakes
//         };

//         // `at < scheduled` is possible when a task switches threads between polls.
//         let elapsed = at.saturating_duration_since(scheduled);

//         // if we have a scheduled time histogram, add the timestamp
//         timestamps.scheduled_histogram.record_duration(elapsed);

//         timestamps.scheduled_time += elapsed;
//     }

//     pub(crate) fn drop_task(&self, at: Instant) {}

//     #[inline]
//     fn make_dirty(&self) {
//         self.is_dirty.swap(true, Ordering::AcqRel);
//     }
// }

impl Histogram {
    fn new(max: u64) -> Self {
        // significant figures should be in the [0-5] range and memory usage
        // grows exponentially with higher a sigfig
        let histogram = hdrhistogram::Histogram::new_with_max(max, 2).unwrap();
        Self {
            histogram,
            max,
            max_outlier: None,
            outliers: 0,
        }
    }

    fn record_duration(&mut self, duration: Duration) {
        let mut duration_ns = duration.as_nanos() as u64;

        // clamp the duration to the histogram's max value
        if duration_ns > self.max {
            self.outliers += 1;
            self.max_outlier = std::cmp::max(self.max_outlier, Some(duration_ns));
            duration_ns = self.max;
        }

        self.histogram
            .record(duration_ns)
            .expect("duration has already been clamped to histogram max value")
    }
}

impl ToProto for Histogram {
    type Output = api::ipc::DurationHistogram;

    fn to_proto(&self, _: &crate::util::TimeAnchor) -> Self::Output {
        let mut serializer = V2Serializer::new();
        let mut raw_histogram = Vec::new();
        serializer
            .serialize(&self.histogram, &mut raw_histogram)
            .expect("histogram failed to serialize");
        api::ipc::DurationHistogram {
            raw_histogram,
            max_value: self.max,
            high_outliers: self.outliers,
            highest_outlier: self.max_outlier,
        }
    }
}
