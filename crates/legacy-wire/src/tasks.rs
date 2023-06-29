use crate::common;

mod generated {
    #![allow(clippy::all)]
    #![allow(warnings)]

    tonic::include_proto!("rs.tauri.devtools.tasks");
}

pub use generated::*;
