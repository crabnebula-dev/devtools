use crate::common;

mod generated {
	#![allow(clippy::all)]
	#![allow(warnings)]

	tonic::include_proto!("rs.devtools.logs");
}

pub use generated::*;
