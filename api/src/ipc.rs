use crate::common;
use crate::tasks;

mod generated {
    #![allow(warnings)]

    tonic::include_proto!("rs.tauri.devtools.ipc");
}

pub use generated::*;