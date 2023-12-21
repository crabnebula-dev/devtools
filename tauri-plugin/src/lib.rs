use colored::Colorize;
use devtools::aggregator::Aggregator;
use devtools::layer::Layer;
use devtools::server::wire::tauri::tauri_server::TauriServer;
use devtools::server::Server;
use devtools::Command;
use devtools::{Error, Result, Shared};
use futures::FutureExt;
use std::net::{IpAddr, Ipv4Addr, SocketAddr, TcpListener};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::Runtime;
use tokio::sync::mpsc;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::Layer as _;

mod server;

fn init_plugin<R: Runtime>(
    addr: SocketAddr,
    publish_interval: Duration,
    aggregator: Aggregator,
    cmd_tx: mpsc::Sender<Command>,
) -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("probe")
        .setup(move |app_handle, _api| {
            let (mut health_reporter, health_service) = tonic_health::server::health_reporter();

            health_reporter
                .set_serving::<TauriServer<server::TauriService<R>>>()
                .now_or_never()
                .unwrap();

            let server = Server::new(
                cmd_tx,
                health_reporter,
                health_service,
                server::TauriService {
                    app_handle: app_handle.clone(),
                },
                server::MetaService {
                    app_handle: app_handle.clone(),
                },
                server::SourcesService {
                    app_handle: app_handle.clone(),
                },
            );

            // spawn the server and aggregator in a separate thread
            // so we don't interfere with the application we're trying to instrument
            // TODO find a way to move this out of the tauri plugin
            thread::spawn(move || {
                use tracing_subscriber::EnvFilter;
                let s = tracing_subscriber::fmt()
                    .with_env_filter(EnvFilter::from_default_env())
                    .finish();
                let _subscriber_guard = tracing::subscriber::set_default(s);

                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .unwrap();

                rt.block_on(async move {
                    let aggregator = tokio::spawn(aggregator.run(publish_interval));
                    server.run(addr).await.unwrap();
                    aggregator.abort();
                });
            });

            Ok(())
        })
        .build()
}

/// Initializes the global tracing subscriber.
///
/// See [`Builder::init`] for details and documentation.
///
/// # Panics
///
/// This function will panic if it is called more than once, or if another library has already initialized a global tracing subscriber.
#[must_use = "This function returns a TauriPlugin that needs to be added to the Tauri app in order to properly instrument it."]
pub fn init<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    Builder::default().init()
}

/// Initializes the global tracing subscriber.
///
/// See [`Builder::try_init`] for details and documentation.
///
/// # Errors
///
/// This function will fail if it is called more than once, or if another library has already initialized a global tracing subscriber.
#[must_use = "This function returns a TauriPlugin that needs to be added to the Tauri app in order to properly instrument it."]
pub fn try_init<R: Runtime>() -> Result<tauri::plugin::TauriPlugin<R>> {
    Builder::default().try_init()
}

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
            #[cfg(any(target_os = "ios", target_os = "android"))]
            host: IpAddr::V4(Ipv4Addr::UNSPECIFIED),
            #[cfg(not(any(target_os = "ios", target_os = "android")))]
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
    /// **default:** [`Ipv4Addr::LOCALHOST`] on desktop, [`Ipv4Addr::UNSPECIFIED`] on mobile.
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
    /// let devtools_plugin = tauri_plugin_devtools::Builder::default().init();
    ///
    /// tauri::Builder::default()
    ///     .plugin(devtools_plugin)
    ///      // ... the rest of the tauri setup code
    /// #   .run(tauri::test::mock_context(tauri::test::noop_assets()))
    /// #   .expect("error while running tauri application");
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
    ///     let devtools_plugin = tauri_plugin_devtools::Builder::default().try_init()?;
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
    pub fn try_init<R: Runtime>(self) -> Result<tauri::plugin::TauriPlugin<R>> {
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
        if !self.strict_port && !port_is_available(&self.host, port) {
            port = (1025..65535)
                .find(|port| port_is_available(&self.host, *port))
                .ok_or(Error::NoFreePorts)?;
        }

        let addr = SocketAddr::new(self.host, port);

        print_link(&addr);

        let plugin = init_plugin(addr, self.publish_interval, aggregator, cmd_tx);
        Ok(plugin)
    }
}

fn port_is_available(host: &IpAddr, port: u16) -> bool {
    TcpListener::bind(SocketAddr::new(host.clone(), port)).is_ok()
}

// This is pretty ugly code I know, but it looks nice in the terminal soo ¯\_(ツ)_/¯
fn print_link(addr: &SocketAddr) {
    let url = if option_env!("__DEVTOOLS_LOCAL_DEVELOPMENT").is_some() {
        "http://localhost:5173/app/dash/"
    } else {
        "https://devtools.crabnebula.dev/app/dash/"
    };

    let url = format!(
        "{url}{}/{}",
        if addr.ip() == Ipv4Addr::UNSPECIFIED {
            local_ip_address::local_ip().unwrap_or_else(|_| addr.ip())
        } else {
            addr.ip()
        },
        addr.port()
    );
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
