use crate::aggregator::Aggregator;
use crate::layer::Layer;
use crate::{tauri_plugin, Shared};
use colored::Colorize;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::sync::Arc;
use std::time::Duration;
use tauri::Runtime;
use tokio::sync::mpsc;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::Layer as _;

pub struct Builder {
    host: IpAddr,
    port: u16,
    publish_interval: Duration,
}

impl Default for Builder {
    fn default() -> Self {
        Self {
            host: IpAddr::V4(Ipv4Addr::LOCALHOST),
            port: 3000,
            publish_interval: Duration::from_millis(200),
        }
    }
}

impl Builder {
    pub fn host(&mut self, host: IpAddr) -> &mut Self {
        self.host = host;
        self
    }

    pub fn port(&mut self, port: u16) -> &mut Self {
        self.port = port;
        self
    }

    pub fn publish_interval(&mut self, interval: Duration) -> &mut Self {
        self.publish_interval = interval;
        self
    }

    /// Initializes the global tracing subscriber.
    ///
    /// This should be called as early in the execution of the app as possible.
    /// Any events that occur before initialization will be ignored.
    ///
    /// This function returns a [`tauri::plugin::TauriPlugin`] that needs to be added to the
    /// Tauri app in order to properly instrument it.
    ///
    /// # Example
    ///
    /// ```ignore
    /// fn main() {
    ///     let devtools = tauri_devtools::Builder::default().init();
    ///
    ///     tauri::Builder::default()
    ///         .plugin(devtools)
    ///         .run(tauri::generate_context!())
    ///         .expect("error while running tauri application");
    /// }
    /// ```
    ///
    /// # Panics
    ///
    /// This function will panic if it is called more than once, or if another library has already initialized a global tracing subscriber.
    #[must_use = "This function returns a TauriPlugin that needs to be added to the Tauri app in order to properly instrument it."]
    pub fn init<R: Runtime>(self) -> tauri::plugin::TauriPlugin<R> {
        self.try_init().unwrap()
    }

    /// Initializes the global tracing subscriber.
    ///
    /// This should be called as early in the execution of the app as possible.
    /// Any events that occur before initialization will be ignored.
    ///
    /// This function returns a [`tauri::plugin::TauriPlugin`] that needs to be added to the
    /// Tauri app in order to properly instrument it.
    ///
    /// # Example
    ///
    /// ```ignore
    /// fn main() {
    ///     let devtools = tauri_devtools::Builder::default().init();
    ///
    ///     tauri::Builder::default()
    ///         .plugin(devtools)
    ///         .run(tauri::generate_context!("../examples/tauri/tauri.conf.json"))
    ///         .expect("error while running tauri application");
    /// }
    /// ```
    ///
    /// # Errors
    ///
    /// This function will fail if it is called more than once, or if another library has already initialized a global tracing subscriber.
    #[must_use = "This function returns a TauriPlugin that needs to be added to the Tauri app in order to properly instrument it."]
    pub fn try_init<R: Runtime>(self) -> crate::Result<tauri::plugin::TauriPlugin<R>> {
        // set up data channels & shared data
        let shared = Arc::new(Shared::default());
        let (event_tx, event_rx) = mpsc::channel(512);
        let (cmd_tx, cmd_rx) = mpsc::channel(256);

        // set up components
        let layer = Layer::new(shared.clone(), event_tx);
        let aggregator = Aggregator::new(shared, event_rx, cmd_rx);

        // initialize early so we don't miss any spans
        tracing_subscriber::registry()
            .with(layer.with_filter(tracing_subscriber::filter::LevelFilter::TRACE))
            .try_init()?;

        let addr = SocketAddr::new(self.host, self.port);

        print_link(&addr);

        let plugin = tauri_plugin::init(addr, self.publish_interval, aggregator, cmd_tx);
        Ok(plugin)
    }
}

// This is pretty ugly code I know, but it looks nice in the terminal soo ¯\_(ツ)_/¯
fn print_link(addr: &SocketAddr) {
    let url = if option_env!("__DEVTOOLS_LOCAL_DEVELOPMENT").is_some() {
        "http://localhost:5173/dash/"
    } else {
        "https://devtools.crabnebula.dev/dash/"
    };

    let url = format!("{url}{}/{}", addr.ip(), addr.port());
    println!(
        r#"
   {} {}{}
   {}   Local:   {}
"#,
        "Tauri Devtools".bright_purple(),
        "v".purple(),
        env!("CARGO_PKG_VERSION").purple(),
        "→".bright_purple(),
        url.underline().blue()
    );
}
