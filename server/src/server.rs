use crate::{api, Result};
use inspector_protocol_primitives::{Inspector, Runtime};
use jsonrpsee::{
	core::id_providers::RandomStringIdProvider,
	server::{ServerBuilder, ServerHandle},
	RpcModule,
};
use std::net::SocketAddr;

const MEGABYTE: u32 = 1024 * 1024;

/// RPC server configuration.
#[derive(Debug)]
pub struct Config {
	/// Socket address.
	pub addr: Option<SocketAddr>,
	/// Maximum connections.
	pub max_connections: u32,
	/// Maximum subscriptions per connection.
	pub max_subs_per_conn: u32,
	/// Maximum rpc request payload size.
	pub max_payload_in_mb: u32,
	/// Maximum rpc response payload size.
	pub max_payload_out_mb: u32,
	/// Tokio runtime handle.
	pub tokio_handle: Option<tokio::runtime::Handle>,
}

impl Default for Config {
	fn default() -> Config {
		Config {
			addr: None,
			max_connections: 10,
			max_subs_per_conn: 50,
			max_payload_in_mb: 5,
			max_payload_out_mb: 5,
			tokio_handle: None,
		}
	}
}

/// Start RPC server listening on given address.
pub async fn start_server<R: Runtime>(
	inspector: Inspector<'static, R>,
	config: Config,
) -> Result<(SocketAddr, ServerHandle)> {
	let Config {
		addr,
		max_payload_in_mb,
		max_payload_out_mb,
		max_connections,
		max_subs_per_conn,
		tokio_handle,
	} = config;

	let expected_addr = addr.unwrap_or(([127, 0, 0, 1], 0).into());
	let mut rpc_api = api::register(inspector)?;
	inject_additional_rpc_methods(&mut rpc_api);

	// Important
	// - denies HTTP requests which isn't a WS upgrade request
	// - include additional methods from `inject_additional_rpc_methods`
	let mut builder = ServerBuilder::new()
		.ws_only()
		.max_request_body_size(max_payload_in_mb.saturating_mul(MEGABYTE))
		.max_response_body_size(max_payload_out_mb.saturating_mul(MEGABYTE))
		.max_connections(max_connections)
		.max_subscriptions_per_connection(max_subs_per_conn)
		.ping_interval(std::time::Duration::from_secs(30))
		.set_id_provider(RandomStringIdProvider::new(16));

	if let Some(tokio_handle) = tokio_handle {
		builder = builder.custom_tokio_runtime(tokio_handle);
	}

	let server = builder.build(&expected_addr).await?;
	let server_addr = server.local_addr()?;
	let handle = server.start(rpc_api);

	Ok((server_addr, handle))
}

fn inject_additional_rpc_methods<M: Send + Sync + 'static>(rpc_api: &mut RpcModule<M>) {
	let mut available_methods = rpc_api.method_names().collect::<Vec<_>>();
	available_methods.sort();

	rpc_api
		.register_method("rpc_methods", move |_, _| {
			serde_json::json!({
				"methods": available_methods,
			})
		})
		.expect("infallible all other methods have their own address space; qed");
}

#[cfg(test)]
mod tests {
	use crate::{mock::server_mock, server::inject_additional_rpc_methods as original_inject_additional_rpc_methods};
	use inspector_protocol_primitives::assert_ok;
	use jsonrpsee::RpcModule;

	#[tokio::test]
	async fn inject_additional_rpc_methods() {
		let mut module = RpcModule::new(());
		let previous_count = module.method_names().count();

		original_inject_additional_rpc_methods(&mut module);
		assert!(module.method_names().count() > previous_count);
	}

	#[tokio::test]
	async fn start_server() {
		assert_ok!(server_mock().await)
	}
}
