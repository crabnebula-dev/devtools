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

pub(crate) struct IPCRequestStats {
    is_dirty: AtomicBool,

    pub(crate) initiated_at: Instant,
    completed_at: Mutex<Option<Instant>>,

    timestamps: Mutex<IPCRequestTimestamps>,
}

#[derive(Debug)]
struct IPCRequestTimestamps {
    deserialize_start: Option<Instant>,
    deserialize_end: Option<Instant>,
    serialize_start: Option<Instant>,
    serialize_end: Option<Instant>,
    inner_start: Option<Instant>,
    inner_end: Option<Instant>,
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
        poll_duration_max: u64,
        scheduled_duration_max: u64,
        initiated_at: Instant,
    ) -> Self {
        Self {
            is_dirty: AtomicBool::new(true),
            initiated_at,
            completed_at: Mutex::new(None),
            // task_stats: TaskStats::new(poll_duration_max, scheduled_duration_max, initiated_at),
            timestamps: Mutex::new(IPCRequestTimestamps {
                deserialize_start: None,
                deserialize_end: None,
                serialize_start: None,
                serialize_end: None,
                inner_start: None,
                inner_end: None,
            }),
        }
    }

    pub(crate) fn start_deserialize(&self, at: Instant) {
        dbg!("lock timestamps for deserialize_start");
        self.timestamps.lock().deserialize_start = Some(at);
        self.make_dirty();
    }

    pub(crate) fn end_deserialize(&self, at: Instant) {
        dbg!("lock timestamps for deserialize_end");
        self.timestamps.lock().deserialize_end = Some(at);
        self.make_dirty();
    }

    pub(crate) fn start_serialize(&self, at: Instant) {
        dbg!("lock timestamps for serialize_start");
        self.timestamps.lock().serialize_start = Some(at);
        self.make_dirty();
    }

    pub(crate) fn end_serialize(&self, at: Instant) {
        dbg!("lock timestamps for serialize_end");
        self.timestamps.lock().serialize_end = Some(at);
        self.make_dirty();
    }

    pub(crate) fn start_inner(&self, at: Instant) {
        dbg!("lock timestamps for inner_start");
        self.timestamps.lock().inner_start = Some(at);
        self.make_dirty();
    }

    pub(crate) fn end_inner(&self, at: Instant) {
        dbg!("lock timestamps for inner_end");
        self.timestamps.lock().inner_end = Some(at);
        self.make_dirty();
    }

    pub(crate) fn complete(&self, at: Instant) {
        dbg!("lock completed_at");
        *self.completed_at.lock() = Some(at);
        self.make_dirty();
    }

    #[inline]
    fn make_dirty(&self) {
        self.is_dirty.swap(true, Ordering::AcqRel);
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
        dbg!("lock timestamps");
        let ts = self.timestamps.lock();

        println!("timestamps {:?}", ts);

        dbg!("lock completed_at");
        api::ipc::Stats {
            initiated_at: Some(base_time.to_timestamp(self.initiated_at)),
            completed_at: self.completed_at.lock().map(|t: Instant| base_time.to_timestamp(t)),
            deserialize_time: match (ts.deserialize_start, ts.deserialize_end) {
                (Some(start), Some(end)) => prost_types::Duration::try_from(end.duration_since(start)).ok(),
                _ => None
            },
            serialize_time:  match (ts.serialize_start, ts.serialize_end) {
                (Some(start), Some(end)) => prost_types::Duration::try_from(end.duration_since(start)).ok(),
                _ => None
            },
            inner_time:  match (ts.inner_start, ts.inner_end) {
                (Some(start), Some(end)) => prost_types::Duration::try_from(end.duration_since(start)).ok(),
                _ => None
            },
            task_stats: None
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

    fn to_proto(&self) -> api::tasks::DurationHistogram {
        let mut serializer = V2Serializer::new();
        let mut raw_histogram = Vec::new();
        serializer
            .serialize(&self.histogram, &mut raw_histogram)
            .expect("histogram failed to serialize");
        api::tasks::DurationHistogram {
            raw_histogram,
            max_value: self.max,
            high_outliers: self.outliers,
            highest_outlier: self.max_outlier,
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
