use crate::common;
use crate::ipc;

mod generated {
    #![allow(clippy::all)]
    #![allow(warnings)]

    tonic::include_proto!("rs.tauri.devtools.instrument");
}

pub use generated::*;

impl InstrumentRequest {
    pub fn new() -> Self {
        Self {
            interests: Interests::all().bits(),
        }
    }

    pub fn new_with_interests(interests: Interests) -> Self {
        Self {
            interests: interests.bits(),
        }
    }
}

impl UpdateInterestsRequest {
    pub fn new(interests: Interests) -> Self {
        Self {
            interests: interests.bits(),
        }
    }
}

bitflags::bitflags! {
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
    pub struct Interests: u32 {
        const Metadata = 0b0001;
        // const Trace = 0b0001;
    }
}
