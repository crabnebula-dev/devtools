//! Inspector protocol plugin for [Tauri](https://tauri.app). Using it looks something like this:
//!
//! ```rust,ignore
//! tauri::Builder::default()
//!     .plugin(inspector_protocol::Builder::new().build())
//!     .run(tauri::generate_context!("./tauri.conf.json"))
//!     .expect("error while running tauri application");
//! ```
//!
//! Then run your application with `--inspect` flag to initialize the Inspector protocol server.
//!
//! Take a look at [the Inspector Protocol guide](book) to learn more about how to use the plugin.

use inspector_protocol_primitives::{Inspector, InspectorBuilder, InspectorMetrics, InternalEvent};
use inspector_protocol_server::Result as InspectorResult;
use inspector_protocol_subscriber::SubscriptionLayer;
use std::{
	fmt,
	net::SocketAddr,
	sync::{Arc, Mutex},
};
use tauri::{plugin::TauriPlugin, RunEvent, Runtime};
use tokio::sync::mpsc;
use tracing_subscriber::{filter, prelude::*, Layer};

// CLI flag that determines whether the inspector protocol
// should be active or not.
const INSPECT_FLAG: &str = "--inspect";
// Plugin name
const PLUGIN_NAME: &str = "inspector-protocol";
// URL of the web-based devtool
// The server host is added automatically eg: `127.0.0.1:56609`
const DEVTOOL_URL: &str = "https://crabnebula.dev/debug/#";

// The guide is here.
pub mod book;

/// Builder for the Inspector Protocol. Allows setting various attributes for the protocol.
#[derive(Clone, Default)]
pub struct Builder {
	socket_addr: Option<SocketAddr>,
}

impl fmt::Debug for Builder {
	fn fmt(&self, fmtr: &mut fmt::Formatter<'_>) -> fmt::Result {
		fmtr.debug_struct("Builder")
			.field("SocketAddr", &self.socket_addr)
			.finish()
	}
}

impl Builder {
	/// Initializes a new `Builder` with default values.
	pub fn new() -> Self {
		Default::default()
	}

	/// Sets the port for the inspector protocol.
	pub fn with_port(mut self, port: u16) -> Self {
		self.socket_addr = Some(([127, 0, 0, 1], port).into());
		self
	}

	/// Builds the inspector protocol and returns a Tauri Plugin.
	///
	/// This method checks for the `--inspect` flag.
	pub fn build<R: Runtime>(self) -> TauriPlugin<R> {
		// FIXME: This also set `initialized_at`, maybe the init before tauri
		// would be a good option, so timing would be from main() first line,
		// to `AppReady` event.
		let inspector = InspectorBuilder::new();

		let should_inspect = std::env::args()
			.collect::<Vec<String>>()
			.contains(&INSPECT_FLAG.to_string());

		// return empty plugin
		if !should_inspect {
			return tauri::plugin::Builder::new(PLUGIN_NAME).build();
		}

		// FIXME: validate channel size
		let (internal_channel_sender, internal_channel_receiver) = mpsc::channel(10_000);
		let isolated_internal_channel_sender = internal_channel_sender.clone();
		tauri::plugin::Builder::new(PLUGIN_NAME)
			.setup(|app| {
				// Build our inspector (with our app handler)
				let inspector = inspector
					.with_internal_channel(internal_channel_sender)
					.build(app, 10_000);

				// Grab reference to the `InspectorMetrics`
				let metrics = inspector.metrics.clone();

				// Spawn 2 process:
				// - Internal events listener (allow us to get metrics not included in Tauri)
				// - JSON RPC server with tracing subscription
				//
				// Spawn internal events listener
				//
				self.spawn_internal_events_listener(metrics, internal_channel_receiver)?
					// Spawn JSON-RPC server with WebSocket transport
					// This also make sure the tracing subscription is linked with
					// our `Inspector` channels.
					.spawn_rpc_server_and_tracing(inspector)
					.map_err(Into::into)
			})
			// NOTE(david): We use `log` to display the log in our "console"
			// if we can get the callstack to works fine, we'll have a better view.
			// FIXME: Better logs message
			.on_page_load(|window, payload| {
				log::trace!("Loaded URL {} in window {}", payload.url(), window.label());
			})
			.on_webview_ready(|window| {
				log::trace!("webview ready for {}", window.label());
			})
			.on_event(move |_app, event| match event {
				RunEvent::Ready => {
					// FIXME: Maybe handle error?
					if let Err(err) =
						tauri::async_runtime::block_on(isolated_internal_channel_sender.send(InternalEvent::AppReady))
					{
						log::error!("{err}");
					}
					log::trace!("Application is ready");
				}
				RunEvent::Exit => {
					log::trace!("Event loop is exiting");
				}
				RunEvent::WindowEvent { label, event, .. } => {
					log::trace!("Window {} received an event: {:?}", label, event);
				}
				RunEvent::ExitRequested { .. } => {
					log::trace!("Exit requested");
				}
				RunEvent::Resumed => {
					log::trace!("Event loop is being resumed");
				}
				_ => {}
			})
			.build()
	}
	/// Spawn `InspectorMetrics` listener with `tauri::async_runtime::spawn`.
	fn spawn_internal_events_listener(
		self,
		metrics: Arc<Mutex<InspectorMetrics>>,
		mut internal_channel_receiver: mpsc::Receiver<InternalEvent>,
	) -> InspectorResult<Self> {
		tauri::async_runtime::spawn(async move {
			// Continuously listen for internal events.
			while let Some(internal_event) = internal_channel_receiver.recv().await {
				match internal_event {
					// When the application signals it's ready,
					// capture the current time and record it in metrics.
					InternalEvent::AppReady => {
						// Attempt to lock the metrics for updating.
						if let Ok(mut metrics) = metrics.try_lock() {
							metrics.ready_at = inspector_protocol_primitives::now();
						}
					}
				}
			}
		});

		Ok(self)
	}

	/// Spawn WebSocket JSON-RPC server with `tauri::async_runtime::spawn`.
	///
	/// Create a subscription to `tracing_subscriber::registry` with our custom
	/// `SubscriptionLayer`.
	fn spawn_rpc_server_and_tracing<R: Runtime>(self, inspector: Inspector<R>) -> InspectorResult<()> {
		tauri::async_runtime::spawn(async move {
			let logs_channel = inspector.channels.logs.clone();

			// Set up a tracing subscriber to capture events and callstack.
			// This subscriber filters for TRACE level logs, but excludes
			// logs originating from `soketto` to reduce noise.
			let tracing_registered = tracing_subscriber::registry()
				.with(
					// FIXME: We'll need to send another channel (for callstack)
					SubscriptionLayer::new(logs_channel)
						.with_filter(tracing_subscriber::filter::LevelFilter::TRACE)
						.with_filter(filter::filter_fn(|metadata| {
							// FIXME: skip `soketto` as it's the main websocket layer
							// and create lot of noise
							!metadata.target().starts_with("soketto")
						})),
				)
				.try_init();

			if let Err(err) = tracing_registered {
				// FIXME: This is a known issue, we can only have 1 global subscriber registered
				// FIXME: Better `tips` handling
				eprintln!("--------- Tauri Inspector Protocol ---------\n");
				eprintln!("Error:");
				eprintln!("  ${err}\n");
				eprintln!("Tips:");
				eprintln!("  - Disable global `tracing_subscriber`");
				eprintln!("\n--------- Tauri Inspector Protocol ---------");

				// cannot initialize subscriber, it doesnt worth going further
				return;
			}

			// Start the inspector protocol server.
			if let Ok((server_addr, server_handle)) = inspector_protocol_server::start_server(
				inspector,
				inspector_protocol_server::Config {
					// FIXME: Add values from the `Builder` process
					// (eg.: custom port)
					..Default::default()
				},
			)
			.await
			{
				println!("--------- Tauri Inspector Protocol ---------\n");
				println!("Listening at:\n  ws://{server_addr}\n",);
				println!("Inspect in browser:\n  ${DEVTOOL_URL}{server_addr}");
				println!("\n--------- Tauri Inspector Protocol ---------");

				// wait for the server to stop
				server_handle.stopped().await
			}
		});

		Ok(())
	}
}
