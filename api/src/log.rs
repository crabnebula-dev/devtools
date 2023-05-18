use crate::common;

mod generated {
    #![allow(warnings)]

    tonic::include_proto!("rs.tauri.devtools.log");
}

pub use generated::*;