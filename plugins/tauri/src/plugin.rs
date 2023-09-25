use inspector_protocol_primitives::{EntryT, LogEntry, SpanEntry};
use inspector_protocol_server::{
	context::{Context, ContextBuilder, ContextMetrics},
	error::Result as ContextResult,
	server::Config,
};
use inspector_protocol_subscriber::{
	config::broadcast::BroadcastConfig, dispatch::broadcast::BroadcastConfigBuilder, subscriber::SubscriberBuilder,
};
use std::{
	fmt,
	net::SocketAddr,
	sync::{Arc, Mutex},
	time::Duration,
};
use tauri::{AppHandle, RunEvent, Runtime};
use tokio::sync::{broadcast, watch};
use tracing::Level;
use tracing_subscriber::filter::{self, LevelFilter};
use tracing_subscriber::prelude::*;

// CLI flag that determines whether the inspector protocol
// should be active or not.
const INSPECT_FLAG: &str = "--inspect";
// Plugin name
const PLUGIN_NAME: &str = "inspector-protocol";
/// URL of the web-based devtool
/// The server host is added automatically eg: `127.0.0.1:56609`.
const DEVTOOL_URL: &str = "https://crabnebula.dev/debug/#";
/// Default tracing level.
const DEFAULT_LEVEL: Level = Level::TRACE;
/// Default interval to broadcast data from the accumulator.
const DEFAULT_INTERVAL: Duration = Duration::from_millis(800);
/// Default [tokio::sync::broadcast] channels capacity.
const DEFAULT_CAPACITY: usize = 10_000;
/// Default WebSocket subscription maximum batch size.
const DEFAULT_BATCH_SIZE: usize = 50;
/// Default simultaneous connections on the inspector protocol server.
const DEFAULT_MAX_CONNECTIONS: u32 = 10;

/// Builder for the Devtools.
/// Allows setting various attributes for the underlaying protocol.
#[derive(Clone)]
#[must_use]
pub struct Builder {
	socket_addr: Option<SocketAddr>,
	capacity: usize,
	batch_size: usize,
	interval: Duration,
	metrics: ContextMetrics,
	max_level: LevelFilter,
	max_connections: u32,
}

impl Default for Builder {
	fn default() -> Self {
		Self {
			socket_addr: None,
			capacity: DEFAULT_CAPACITY,
			batch_size: DEFAULT_BATCH_SIZE,
			interval: DEFAULT_INTERVAL,
			max_connections: DEFAULT_MAX_CONNECTIONS,
			max_level: DEFAULT_LEVEL.into(),
			metrics: ContextMetrics::default(),
		}
	}
}

impl Builder {
	/// Initializes a new `Builder` with default values.
	pub fn new() -> Self {
		Default::default()
	}

	/// Sets the port for the inspector protocol.
	/// Default: Random
	pub fn with_port(mut self, port: u16) -> Self {
		self.socket_addr = Some(([127, 0, 0, 1], port).into());
		self
	}

	/// Sets the broadcast channels capacity.
	pub fn with_capacity(mut self, capacity: usize) -> Self {
		self.capacity = capacity;
		self
	}

	/// Sets the broadcast channels capacity.
	pub fn with_max_level(mut self, level: impl Into<LevelFilter>) -> Self {
		self.max_level = level.into();
		self
	}

	/// Set the max batch size for the [LogEntry] and [SpanEntry] subscription.
	pub fn with_batch_size(mut self, batch_size: usize) -> Self {
		self.batch_size = batch_size;
		self
	}

	/// Set the interval the subscriber will broadcast data to the channels.
	pub fn with_interval(mut self, interval: Duration) -> Self {
		self.interval = interval;
		self
	}

	/// Set the maximum number of simultaneous connections on the WebSocket server.
	pub fn with_max_connections(mut self, max_connections: u32) -> Self {
		self.max_connections = max_connections;
		self
	}

	/// Finish the builder, returning a new [`Devtools`].
	pub fn finish(mut self) -> Devtools {
		let enabled = std::env::args()
			.collect::<Vec<String>>()
			.contains(&INSPECT_FLAG.to_string());

		if !enabled {
			self.capacity = 1;
		}

		let (logs_sender, _) = broadcast::channel(self.capacity);
		let (spans_sender, _) = broadcast::channel(self.capacity);
		let (shutdown_signal, _) = watch::channel(());

		Devtools {
			enabled,
			metrics: Arc::new(Mutex::new(self.metrics)),
			logs_sender,
			spans_sender,
			interval: self.interval,
			socket_addr: self.socket_addr.unwrap_or(([127, 0, 0, 1], 0).into()),
			batch_size: self.batch_size,
			max_level: self.max_level,
			shutdown_signal,
		}
	}

	/// Install this Subscriber as the global default if not already set.
	pub fn try_init(self) -> Result<Devtools, Box<dyn std::error::Error + Send + Sync>> {
		self.finish().try_init()
	}

	/// Install this Subscriber as the global default.
	pub fn init(self) -> Devtools {
		self.finish().init()
	}

	/// Finish the builder, returning a new [`SubscriberBuilder`].
	pub fn layer(self) -> SubscriberBuilder<BroadcastConfig> {
		self.finish().layer()
	}
}

/// Devtools Tauri Plugin
///
/// The [WebSocket server](inspector_protocol_server) is started only when the
/// tauri plugin is initialized.
pub struct Devtools {
	enabled: bool,
	batch_size: usize,
	interval: Duration,
	socket_addr: SocketAddr,
	metrics: Arc<Mutex<ContextMetrics>>,
	max_level: LevelFilter,
	logs_sender: broadcast::Sender<Vec<LogEntry>>,
	spans_sender: broadcast::Sender<Vec<SpanEntry>>,
	shutdown_signal: watch::Sender<()>,
}

impl fmt::Debug for Devtools {
	fn fmt(&self, fmtr: &mut fmt::Formatter<'_>) -> fmt::Result {
		fmtr.debug_struct("Devtools")
			.field("SocketAddr", &self.socket_addr)
			.field("Metrics", &self.metrics)
			.finish()
	}
}

impl Devtools {
	/// Attempts to set `self` as the global default tracing [subscriber](tracing)
	/// in the current scope, panicking if this fails.
	///
	/// This method panics if a global default subscriber has already been set.
	pub fn init(self) -> Self {
		self.try_init().expect("failed to set global default subscriber")
	}

	/// Attempts to set `self` as the global default tracing [subscriber](tracing)
	/// in the current scope, returning an error if one is already set.
	///
	/// This method returns an error if a global default subscriber has already
	/// been set.
	pub fn try_init(self) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
		if self.enabled {
			self.layer()
				.with_max_level(self.max_level)
				.finish()
				.with(filter::filter_fn(|metadata| {
					// FIXME: Maybe include it via the builder?
					!metadata.target().contains("soketto") && !metadata.target().contains("jsonrpsee")
				}))
				.try_init()?;
		}

		Ok(self)
	}

	/// Return [`SubscriberBuilder`] to customize the [subscriber](tracing).
	///
	/// ```rust
	/// use tauri_plugin_devtools::devtools;
	/// use tracing_subscriber::prelude::*;
	///
	/// let devtools = devtools()
	///   .with_max_level(tracing::Level::INFO)
	///   .layer()
	///   .finish();
	///
	/// devtools
	///   .with(tracing_subscriber::fmt::layer())
	///   .init();
	/// ```
	pub fn layer(&self) -> SubscriberBuilder<BroadcastConfig> {
		inspector_protocol_subscriber::broadcast(
			BroadcastConfigBuilder::new()
				.with_logs_sender(self.logs_sender.clone())
				.with_spans_sender(self.spans_sender.clone())
				.with_shutdown_receiver(self.shutdown_signal.subscribe())
				.with_tokio_handle(tauri::async_runtime::handle().inner().clone())
				.with_batch_size(self.batch_size)
				.with_interval(self.interval)
				.build(),
		)
	}
}

impl<R: Runtime> tauri::plugin::Plugin<R> for Devtools {
	fn name(&self) -> &'static str {
		PLUGIN_NAME
	}

	fn initialize(&mut self, app: &AppHandle<R>, _config: serde_json::Value) -> Result<(), Box<dyn std::error::Error>> {
		if !self.enabled {
			return Ok(());
		}

		let inspector = ContextBuilder::new()
			.with_metrics(self.metrics.clone())
			.with_logs_channel(self.logs_sender.clone())
			.with_spans_channel(self.spans_sender.clone())
			.build(app);

		spawn_rpc_server(inspector, Config::new().with_socket_addr(self.socket_addr)).map_err(Into::into)
	}

	fn on_event(&mut self, _app: &AppHandle<R>, event: &RunEvent) {
		if !self.enabled {
			return;
		}

		match event {
			RunEvent::Ready => {
				if let Ok(mut metrics) = self.metrics.lock() {
					metrics.ready_at = inspector_protocol_primitives::now();
				}
				log::debug!("Application is ready");
			}
			RunEvent::Exit => {
				// Shutdown signal for the `Broadcaster`, this will make sure all queued items
				// are sent to all event subscribers.
				if let Err(e) = self.shutdown_signal.send(()) {
					log::error!("{e}");
				}
			}
			RunEvent::WindowEvent { label, .. } => {
				log::debug!("Window {} received an event", label);
			}
			RunEvent::ExitRequested { .. } => {
				log::debug!("Exit requested");
			}
			RunEvent::Resumed => {
				log::debug!("Event loop is being resumed");
			}
			_ => {}
		}
	}
}

/// Spawn WebSocket JSON-RPC server.
fn spawn_rpc_server<R: Runtime, L: EntryT, S: EntryT>(context: Context<R, L, S>, config: Config) -> ContextResult<()> {
	tauri::async_runtime::spawn(async move {
		// Start the inspector protocol server.
		if let Ok((server_addr, server_handle)) = inspector_protocol_server::server::start_server(context, config).await
		{
			println!("--------- Tauri Plugin Devtools ---------\n");
			println!("Listening at:\n  ws://{server_addr}\n",);
			println!("Inspect in browser:\n  {DEVTOOL_URL}{server_addr}");
			println!("\n--------- Tauri Plugin Devtools ---------");

			// wait for the server to stop
			server_handle.stopped().await
		}
	});

	Ok(())
}
