pub use error::{Error, Result};
pub use server::start_server;

mod api;
mod error;
#[cfg(test)]
mod mock;
mod server;
