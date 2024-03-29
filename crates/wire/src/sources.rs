mod generated {
    #![allow(warnings)]
    #![allow(clippy::all, clippy::pedantic)]
    include!("./generated/rs.devtools.sources.rs");
}

use bitflags::bitflags;
pub use generated::*;

bitflags! {
    pub struct FileType: u32 {
        const DIR      = 1 << 0;
        const FILE     = 1 << 1;
        const SYMLINK  = 1 << 2;
        const ASSET    = 1 << 3;
        const RESOURCE = 1 << 4;
    }
}
