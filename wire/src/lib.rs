mod common;
pub mod instrument;
pub mod logs;
pub mod spans;
pub mod tauri;

pub use common::*;

mod generated {
	#![allow(clippy::all)]
	#![allow(warnings)]
	include!(concat!(env!("OUT_DIR"), "/include.rs"));
}
