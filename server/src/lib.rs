pub use error::{Error, Result};
pub use server::{start_server, Config};

mod api;
mod error;
#[cfg(test)]
mod mock;
mod server;
