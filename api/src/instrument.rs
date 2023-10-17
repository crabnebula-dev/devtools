use bitflags::bitflags;

pub use crate::generated::rs::devtools::instrument::*;

bitflags! {
    #[derive(Debug, Clone, Copy)]
    pub struct Interests: u32 {
        const SPANS = 1 << 0;
        const LOGS = 1 << 1;

        // Future versions might define additional flags
        const _ = !0;
    }
}
