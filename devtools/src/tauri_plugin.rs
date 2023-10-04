use crate::broadcaster::Broadcaster;
use crate::server::Server;
use colored::Colorize;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, RunEvent, Runtime};
use tauri_devtools_shared as shared;
use tauri_devtools_shared::{LogEntry, Metrics, SpanEntry};
use tokio::sync::{broadcast, watch};

/// URL of the web-based devtool
/// The server host is added automatically eg: `127.0.0.1:56609`.
const DEVTOOL_URL: &str = "http://localhost:5173/dash/";

#[allow(clippy::type_complexity)]
pub struct TauriPlugin {
	enabled: bool,
	init: Option<(
		Broadcaster,
		broadcast::Sender<Vec<LogEntry>>,
		broadcast::Sender<Vec<SpanEntry>>,
	)>,
	metrics: Arc<Mutex<Metrics>>,
	shutdown_tx: watch::Sender<()>,
}

impl TauriPlugin {
	pub(crate) fn new(
		enabled: bool,
		broadcaster: Broadcaster,
		logs_tx: broadcast::Sender<Vec<LogEntry>>,
		spans_tx: broadcast::Sender<Vec<SpanEntry>>,
		shutdown_tx: watch::Sender<()>,
	) -> Self {
		Self {
			enabled,
			init: Some((broadcaster, logs_tx, spans_tx)),
			metrics: Arc::new(Mutex::new(Metrics {
				initialized_at: shared::now(),
				ready_at: 0,
			})),
			shutdown_tx,
		}
	}
}

impl<R: Runtime> tauri::plugin::Plugin<R> for TauriPlugin {
	fn name(&self) -> &'static str {
		"devtools"
	}

	fn initialize(&mut self, app_handle: &AppHandle<R>, _: serde_json::Value) -> tauri::plugin::Result<()> {
		if !self.enabled {
			return Ok(());
		}

		let (broadcaster, logs_tx, spans_tx) = self.init.take().unwrap();

		let server = Server::new(logs_tx, spans_tx, app_handle.clone(), self.metrics.clone());
		spawn_handler_thread(broadcaster, server);

		Ok(())
	}

	fn on_event(&mut self, _: &AppHandle<R>, event: &RunEvent) {
		if !self.enabled {
			return;
		}

		match event {
			RunEvent::Ready => {
				if let Ok(mut metrics) = self.metrics.lock() {
					metrics.ready_at = shared::now();
				}
				tracing::debug!("Application is ready");
			}
			RunEvent::Exit => {
				// Shutdown signal for the `Broadcaster`, this will make sure all queued items
				// are sent to all event subscribers.
				if let Err(e) = self.shutdown_tx.send(()) {
					tracing::error!("{e}");
				}
			}
			RunEvent::WindowEvent { label, .. } => {
				tracing::debug!("Window {} received an event", label);
			}
			RunEvent::ExitRequested { .. } => {
				tracing::debug!("Exit requested");
			}
			RunEvent::Resumed => {
				tracing::debug!("Event loop is being resumed");
			}
			_ => {}
		}
	}
}

fn spawn_handler_thread<R: Runtime>(broadcaster: Broadcaster, server: Server<R>) {
	thread::spawn(move || {
		let _subscriber_guard = tracing::subscriber::set_default(tracing_core::subscriber::NoSubscriber::default());

		let rt = tokio::runtime::Builder::new_current_thread()
			.enable_all()
			.build()
			.unwrap();

		rt.block_on(async move {
			let broadcaster = tokio::spawn(broadcaster.run());

			let (server_addr, server_handle) = server.run(&Server::<R>::DEFAULT_ADDRESS).await.unwrap();

			let version = env!("CARGO_PKG_VERSION");

			// This is pretty ugly code I know
			let url = format!("{DEVTOOL_URL}{}/{}", server_addr.ip(), server_addr.port());
			println!(
				r#"
   {} {}{}
   {}   Local:   {}
"#,
				"Tauri Devtools".bright_purple(),
				"v".purple(),
				version.purple(),
				"→".bright_purple(),
				url.underline().blue()
			);

			server_handle.stopped().await;
			broadcaster.abort();
		})
	});
}
