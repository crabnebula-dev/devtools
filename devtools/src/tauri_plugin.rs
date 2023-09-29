use crate::broadcaster::Broadcaster;
use crate::server::{Server, DEFAULT_ADDRESS};
use crate::Command;
use std::sync::Arc;
use std::thread;
use std::time::SystemTime;
use tauri::{AppHandle, RunEvent, Runtime};
use tauri_devtools_wire_format::tauri::Metrics;
use tokio::sync::{mpsc, RwLock};

/// URL of the web-based devtool
/// The server host is added automatically eg: `127.0.0.1:56609`.
const DEVTOOL_URL: &str = "https://crabnebula.dev/debug/#";

#[allow(clippy::type_complexity)]
pub struct TauriPlugin {
	enabled: bool,
	init: Option<(Broadcaster, mpsc::Sender<Command>)>,
	metrics: Arc<RwLock<Metrics>>,
	shutdown_tx: Option<oneshot::Sender<()>>,
}

impl TauriPlugin {
	pub(crate) fn new(enabled: bool, broadcaster: Broadcaster, cmd_tx: mpsc::Sender<Command>) -> Self {
		Self {
			enabled,
			init: Some((broadcaster, cmd_tx)),
			metrics: Arc::new(RwLock::new(Metrics {
				initialized_at: Some(SystemTime::now().into()),
				ready_at: None,
			})),
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

		let (broadcaster, cmd_tx) = self.init.take().unwrap();

		let server = Server::new(cmd_tx, app_handle.clone(), self.metrics.clone());
		spawn_handler_thread(broadcaster, server);

		Ok(())
	}

	fn on_event(&mut self, _: &AppHandle<R>, event: &RunEvent) {
		if !self.enabled {
			return;
		}

		match event {
			RunEvent::Ready => {
				let mut metrics = self.metrics.blocking_write();
				metrics.ready_at = Some(SystemTime::now().into());

				tracing::debug!("Application is ready");
			}
			// RunEvent::ExitRequested { api, .. } => {
			// 	// We signal the gRPC server to gracefully shut down,
			// 	// which in-turn will cause the broadcaster to flush all updates and shut down
			// 	// this takes some time however so we prevent the app from exiting right now
			// 	tracing::debug!("Received exit request, terminating...");
			// 	SHUTDOWN_SIGNAL.notify_one();
			// 	api.prevent_exit();
			// }
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

			let addr = DEFAULT_ADDRESS;

			println!("--------- Tauri Plugin Devtools ---------\n");
			println!("Listening at:\n  http://{addr}\n",);
			println!("Inspect in browser:\n  {DEVTOOL_URL}{addr}");
			println!("\n--------- Tauri Plugin Devtools ---------");

			server.run(addr).await.unwrap();

			broadcaster.abort();
		})
	});
}
