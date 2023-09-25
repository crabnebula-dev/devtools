use crate::config::Config;
use crate::{api, context::Context, error::Result};
use jsonrpsee::{
	core::id_providers::RandomStringIdProvider,
	server::{ServerBuilder, ServerHandle},
	RpcModule,
};
use std::net::SocketAddr;

// Define the size of a megabyte in bytes.
const MEGABYTE: u32 = 1024 * 1024;

/// Configuration options for the RPC server.
///
/// This struct encapsulates various settings that can be adjusted for the RPC server.
/// It includes options for maximum connections, payload sizes, and even Tokio runtime settings.
///
/// # Example
///
/// ```rust
/// use inspector_protocol_server::server::ServerConfig;
/// let config = ServerConfig::new()
///     .with_max_connections(100)
///     .with_max_subs_per_conn(10)
///     .with_socket_addr("127.0.0.1:3030".parse().unwrap());
/// ```
#[derive(Debug)]
pub struct ServerConfig {
	/// The address at which the RPC server should listen.
	pub addr: Option<SocketAddr>,
	/// Maximum number of simultaneous connections to the RPC server.
	pub max_connections: u32,
	/// Maximum number of subscriptions allowed per connection.
	pub max_subs_per_conn: u32,
	/// Maximum size of the incoming payload, in megabytes.
	pub max_payload_in_mb: u32,
	/// Maximum size of the outgoing payload, in megabytes.
	pub max_payload_out_mb: u32,
	/// Optional handle for a custom Tokio runtime.
	pub tokio_handle: Option<tokio::runtime::Handle>,
}

impl Default for ServerConfig {
	fn default() -> ServerConfig {
		ServerConfig {
			addr: None,
			max_connections: 10,
			max_subs_per_conn: 50,
			max_payload_in_mb: 5,
			max_payload_out_mb: 5,
			tokio_handle: None,
		}
	}
}

impl ServerConfig {
	/// Creates a new `ServerConfig` instance with default values.
	///
	/// # Example
	///
	/// ```rust
	/// use inspector_protocol_server::server::ServerConfig;
	/// let config = ServerConfig::new();
	/// ```
	pub fn new() -> Self {
		ServerConfig::default()
	}

	/// Sets the maximum number of connections for the RPC server.
	///
	/// # Example
	///
	/// ```rust
	/// use inspector_protocol_server::server::ServerConfig;
	/// let config = ServerConfig::new().with_max_connections(100);
	/// ```
	pub fn with_max_connections(mut self, max_connections: u32) -> Self {
		self.max_connections = max_connections;
		self
	}

	/// Sets the maximum number of subscriptions per connection.
	///
	/// # Example
	///
	/// ```rust
	/// use inspector_protocol_server::server::ServerConfig;
	/// let config = ServerConfig::new().with_max_subs_per_conn(50);
	/// ```
	pub fn with_max_subs_per_conn(mut self, max_subs_per_conn: u32) -> Self {
		self.max_subs_per_conn = max_subs_per_conn;
		self
	}

	/// Sets the maximum payload size for incoming messages, in megabytes.
	///
	/// # Example
	///
	/// ```rust
	/// use inspector_protocol_server::server::ServerConfig;
	/// let config = ServerConfig::new().with_max_payload_in_mb(5);
	/// ```
	pub fn with_max_payload_in_mb(mut self, max_payload_in_mb: u32) -> Self {
		self.max_payload_in_mb = max_payload_in_mb;
		self
	}

	/// Sets the maximum payload size for outgoing messages, in megabytes.
	///
	/// # Example
	///
	/// ```rust
	/// use inspector_protocol_server::server::ServerConfig;
	/// let config = ServerConfig::new().with_max_payload_out_mb(5);
	/// ```
	pub fn with_max_payload_out_mb(mut self, max_payload_out_mb: u32) -> Self {
		self.max_payload_out_mb = max_payload_out_mb;
		self
	}

	/// Associates a custom Tokio runtime handle with the server.
	///
	/// # Example
	///
	/// ```rust
	/// use inspector_protocol_server::server::ServerConfig;
	/// let runtime = tokio::runtime::Runtime::new().unwrap();
	/// let handle = runtime.handle().clone();
	/// let config = ServerConfig::new().with_tokio_handle(handle);
	/// ```
	pub fn with_tokio_handle(mut self, tokio_handle: tokio::runtime::Handle) -> Self {
		self.tokio_handle = Some(tokio_handle);
		self
	}

	/// Sets the socket address where the RPC server will listen.
	///
	/// # Example
	///
	/// ```rust
	/// use inspector_protocol_server::server::ServerConfig;
	/// let config = ServerConfig::new().with_socket_addr("127.0.0.1:8080".parse().unwrap());
	/// ```
	pub fn with_socket_addr(mut self, socket_addr: SocketAddr) -> Self {
		self.addr = Some(socket_addr);
		self
	}
}

/// Initializes and starts an RPC server with the given context and configuration.
///
/// This function creates an RPC server based on the provided context and configuration settings,
/// and then starts listening for incoming connections. It returns the actual socket address
/// on which the server is listening along with a handle to the server for further interactions.
///
/// # Arguments
///
/// * `context` - The context containing channels and metrics for the server.
/// * `config` - A [`ServerConfig`] instance containing various server options.
///
/// # Returns
///
/// This function returns a tuple containing the server's local address and
/// a handle to the server.
pub async fn start_server<C: Config>(context: Context<C>, config: ServerConfig) -> Result<(SocketAddr, ServerHandle)> {
	let ServerConfig {
		addr,
		max_payload_in_mb,
		max_payload_out_mb,
		max_connections,
		max_subs_per_conn,
		tokio_handle,
	} = config;

	// provided addr or select a random port
	let expected_addr = addr.unwrap_or(([127, 0, 0, 1], 0).into());

	// build our api methods
	let mut rpc_api = api::register(context)?;
	// inject helpers
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

// Injects additional RPC methods into the server.
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
