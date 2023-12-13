use crate::aggregator::Aggregator;
use crate::layer::Layer;
use crate::{tauri_plugin, Error, Shared};
use colored::Colorize;
use std::net::{IpAddr, Ipv4Addr, SocketAddr, TcpListener};
use std::sync::Arc;
use std::time::Duration;
use tauri::Runtime;
use tokio::sync::mpsc;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::Layer as _;

/// The builder can be use to customize the instrumentation.
pub struct Builder {
    host: IpAddr,
    port: u16,
    publish_interval: Duration,
    strict_port: bool,
}

impl Default for Builder {
    fn default() -> Self {
        Self {
            host: IpAddr::V4(Ipv4Addr::LOCALHOST),
            port: 3000,
            publish_interval: Duration::from_millis(200),
            strict_port: false,
        }
    }
}

impl Builder {
    /// Specify which IP addresses the instrumentation server should listen on.
    ///
    /// You can set this to [`Ipv4Addr::UNSPECIFIED`] to listen on all addresses, including LAN and public ones.
    ///
    /// **default:** [`Ipv4Addr::LOCALHOST`]
    pub fn host(&mut self, host: IpAddr) -> &mut Self {
        self.host = host;
        self
    }

    /// Specify the instrumentation server port.
    ///
    /// Currently `devtools` **does not** pick a random free port if the configured one
    /// is already taken, so you will need to configure a different one manually.
    ///
    /// **default:** `3000`
    pub fn port(&mut self, port: u16) -> &mut Self {
        self.port = port;
        self
    }

    /// By default the instrumentation will pick a free port if the default (or configured) one is
    /// no available. By setting this to `true` you can disable this behaviour and cause
    /// the server to abort instead.
    ///
    /// **default:** `false`
    pub fn strict_port(&mut self, strict: bool) -> &mut Self {
        self.strict_port = strict;
        self
    }

    /// The interval in which updates are sent to the connected UI.
    ///
    /// You can tweak this setting to reduce the time between updates, when for example your app
    /// is generating a lot of events, the buffer might fill up and cause some events to get lost.
    ///
    /// **default:** `200ms`
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
    /// Make sure to check out the `examples` sub folder for a fully working setup.
    ///
    /// ```no_run
    /// fn main() {
    ///     let devtools_plugin = devtools::Builder::default().init();
    ///
    ///     tauri::Builder::default()
    ///         .plugin(devtools_plugin)
    ///          // ... the rest of the tauri setup code
    /// #       .run(tauri::test::mock_context(tauri::test::noop_assets()))
    /// #       .expect("error while running tauri application");
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
    /// Make sure to check out the `examples` sub folder for a fully working setup.
    ///
    /// ```no_run
    /// fn main() -> Result<(), Box<dyn std::error::Error>> {
    ///     let devtools_plugin = devtools::Builder::default().try_init()?;
    ///
    ///     tauri::Builder::default()
    ///         .plugin(devtools_plugin)
    ///          // ... the rest of the tauri setup code
    /// #       .run(tauri::test::mock_context(tauri::test::noop_assets()))
    /// #       .expect("error while running tauri application");
    ///
    ///     Ok(())
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

        let mut port = self.port;
        if !port_is_available(port) && !self.strict_port {
            port = (1025..65535)
                .find(|port| port_is_available(*port))
                .ok_or(Error::NoFreePorts)?;
        }

        let addr = SocketAddr::new(self.host, port);

        print_link(&addr);

        let plugin = tauri_plugin::init(addr, self.publish_interval, aggregator, cmd_tx);
        Ok(plugin)
    }
}

fn port_is_available(port: u16) -> bool {
    TcpListener::bind(("127.0.0.1", port)).is_ok()
}

// This is pretty ugly code I know, but it looks nice in the terminal soo ¯\_(ツ)_/¯
fn print_link(addr: &SocketAddr) {
    let url = if option_env!("__DEVTOOLS_LOCAL_DEVELOPMENT").is_some() {
        "http://localhost:5173/app/dash/"
    } else {
        "https://devtools.crabnebula.dev/app/dash/"
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
