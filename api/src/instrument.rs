use crate::common;
use crate::trace;

mod generated {
    #![allow(warnings)]

    tonic::include_proto!("rs.tauri.devtools.instrument");
}

pub use generated::*;

impl InstrumentRequest {
    pub fn new() -> Self {
        Self { sources: Sources::All.bits() }
    }

    pub fn new_with_sources(sources: Sources) -> Self {
        Self { sources: sources.bits() }
    }
}

impl PauseRequest {
    pub fn new() -> Self {
        Self { sources: Sources::All.bits() }
    }

    pub fn new_with_sources(sources: Sources) -> Self {
        Self { sources: sources.bits() }
    }
}

impl ResumeRequest {
    pub fn new() -> Self {
        Self { sources: Sources::All.bits() }
    }

    pub fn new_with_sources(sources: Sources) -> Self {
        Self { sources: sources.bits() }
    }
}

bitflags::bitflags! {
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
    pub struct Sources: u32 {
        const Trace = 0b0001;
        const Metadata = 0b0010;

        const All = Self::Trace.bits() | Self::Metadata.bits();
    }
}