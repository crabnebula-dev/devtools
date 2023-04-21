#![cfg_attr(feature = "nightly-thread-id", feature(thread_id_value))]

mod common;
pub mod instrument;
pub mod trace;
pub use common::*;

#[cfg(not(feature = "nightly-thread-id"))]
pub mod thread_id {
    use std::{
        cell::Cell,
        num::NonZeroU64,
        sync::{atomic::{AtomicUsize, Ordering}, Once},
    };

    static THREAD_COUNTER: AtomicUsize = AtomicUsize::new(1);

    thread_local! {
        static THREAD_ID_INIT: Once = Once::new();
        static THREAD_ID: Cell<NonZeroU64>  = Cell::new(unsafe { NonZeroU64::new_unchecked(1) });
    }

    #[derive(Debug)]
    pub struct ThreadId(NonZeroU64);

    impl ThreadId {
        pub fn as_u64(&self) -> NonZeroU64 {
            self.0
        }
    }

    pub fn get_thread_id() -> ThreadId {
        THREAD_ID_INIT.with(|init_guard| {
            init_guard.call_once(|| {
                THREAD_ID.with(|id| {
                    let new_id = THREAD_COUNTER.fetch_add(1, Ordering::SeqCst) as u64;
                    // THREAD_COUNTER is initialized to one and we only ever add to it
                    id.set(unsafe { NonZeroU64::new_unchecked(new_id) });
                })
            });

            THREAD_ID.with(|id| ThreadId(id.get()))
        })
    }
}

#[cfg(feature = "nightly-thread-id")]
pub mod thread_id {
    pub use std::thread::ThreadId;

    pub fn get_thread_id() -> ThreadId {
        std::thread::current().id()
    }
}
