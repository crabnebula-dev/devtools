mod api;
pub mod config;
pub mod context;
pub mod error;
#[cfg(test)]
mod mock;
pub mod server;

// Expose a few of the most common types at root,
// but leave most types behind their respective modules.
pub use crate::{
	context::ContextBuilder,
	server::{start_server, ServerConfig},
};
