use crate::{Inspector, Result};
use inspector_protocol_macro::rpc;
use inspector_protocol_primitives::{AppMetrics, Runtime};
use jsonrpsee::types::error::ErrorCode;
use std::sync::Mutex;

pub struct PerformanceApi;

#[rpc(namespace = "performance")]
impl PerformanceApi {
	/// Get basic metrics
	#[method(name = "getMetrics")]
	fn get_metrics<'a, R: Runtime>(inspector: &'a Inspector<'_, R>) -> Result<&'a Mutex<AppMetrics>, ErrorCode> {
		Ok(inspector.metrics())
	}
}

#[cfg(test)]
mod tests {
	use crate::{mock::server_mock, Result};

	#[tokio::test]
	async fn performance_methods() -> Result<()> {
		let (_addr, handle) = server_mock().await?;

		// FIXME: add extensive tests with a client?

		handle.stop()?;
		Ok(())
	}
}
