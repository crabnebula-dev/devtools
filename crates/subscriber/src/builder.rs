use std::{
    net::{IpAddr, Ipv4Addr, SocketAddr},
    sync::Arc,
    thread,
    time::Duration,
};

use tokio::{runtime, sync::mpsc};
use tracing_subscriber::{filter, prelude::*};

use crate::{
    aggregator::Aggregator, layer::Layer, server::Server, util::spawn_named, zeroconf::Zeroconf,
    CrateInfo, Shared,
};

pub const DEFAULT_INSTRUMENT_PORT: u16 = 6669;
pub const DEFAULT_FILTER_ENV_VAR: &str = "RUST_LOG";

/// Default frequency for publishing events to clients.
const DEFAULT_PUBLISH_INTERVAL: Duration = Duration::from_millis(250);

// Default maximum capacity for the channel of events sent from a
/// [`ConsoleLayer`] to a [`Server`].
///
/// When this capacity is exhausted, additional events will be dropped.
/// Decreasing this value will reduce memory usage, but may result in
/// events being dropped more frequently.
///
/// See also [`Builder::event_buffer_capacity`].
pub const DEFAULT_EVENT_BUFFER_CAPACITY: usize = 1024 * 100;

/// Default maximum capacity for the channel of events sent from a
/// [`Server`] to each subscribed client.
///
/// When this capacity is exhausted, the client is assumed to be inactive,
/// and may be disconnected.
const DEFAULT_CLIENT_BUFFER_CAPACITY: usize = 1024 * 4;

pub struct Builder {
    instrument_addr: SocketAddr,
    crash_addr: Option<SocketAddr>,
    publish_interval: Duration,
    event_buffer_capacity: usize,
    client_buffer_capacity: usize,
    flush_threshold: usize,
    filter_env_var: String,
    self_trace: bool,
}

impl Default for Builder {
    fn default() -> Self {
        let instrument_port = portpicker::is_free_tcp(DEFAULT_INSTRUMENT_PORT)
            .then_some(DEFAULT_INSTRUMENT_PORT)
            .or_else(|| portpicker::pick_unused_port())
            .expect("no free port available");

        Self {
            instrument_addr: SocketAddr::new(IpAddr::V4(Ipv4Addr::UNSPECIFIED), instrument_port),
            crash_addr: None,
            publish_interval: DEFAULT_PUBLISH_INTERVAL,
            event_buffer_capacity: DEFAULT_EVENT_BUFFER_CAPACITY,
            client_buffer_capacity: DEFAULT_CLIENT_BUFFER_CAPACITY,
            flush_threshold: DEFAULT_EVENT_BUFFER_CAPACITY / 2,
            filter_env_var: DEFAULT_FILTER_ENV_VAR.to_string(),
            self_trace: false,
        }
    }
}

impl Builder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn get_instrument_addr(&self) -> &SocketAddr {
        &self.instrument_addr
    }

    pub fn init(self, info: impl Into<CrateInfo>) {
        self.try_init(info).expect("failed to initialize devtools");
    }

    pub fn try_init(self, info: impl Into<CrateInfo>) -> crate::Result<()> {
        // TODO re-enable crash reporter when it's not trash anymore
        // let mut crash_reporter = crash_reporter::Builder::default();
        // if let Some(crash_addr) = self.crash_addr {
        //     crash_reporter.set_grpc_addr(crash_addr);
        // }
        // let crash_port = crash_reporter.get_grpc_addr().port();
        // crash_reporter.try_init()?;

        // TODO init panic handler

        let shared = Arc::new(Shared::default());

        let (event_tx, events) = mpsc::channel(self.event_buffer_capacity);
        let (command_tx, commands) = mpsc::channel(256);

        let layer = Layer::new(shared.clone(), event_tx, self.flush_threshold);
        let aggregator = Aggregator::new(shared, events, commands);
        let server = Server::new(command_tx, self.client_buffer_capacity);
        let zeroconf = Zeroconf::new_from_env(
            self.instrument_addr.port(),
            /*crash_port,*/ info.into(),
        )?;

        thread::Builder::new()
            .name("devtools".into())
            .spawn(move || {
                let _subscriber_guard;
                if !self.self_trace {
                    _subscriber_guard = tracing::subscriber::set_default(
                        tracing_core::subscriber::NoSubscriber::default(),
                    );
                }

                let runtime = runtime::Builder::new_current_thread()
                    .enable_io()
                    .enable_time()
                    .build()
                    .expect("runtime initialization failed");

                runtime.block_on(async move {
                    let zeroconf = spawn_named(zeroconf.run(), "devtools::zeroconf");

                    let aggregate =
                        spawn_named(aggregator.run(self.publish_interval), "devtools::aggregate");

                    spawn_named(server.run(self.instrument_addr), "devtools::serve")
                        .await
                        .unwrap()
                        .unwrap();

                    aggregate.abort();
                    zeroconf.abort();
                });
            })
            .expect("console subscriber could not spawn thread");

        type Filter = filter::Targets;

        let fmt_filter = std::env::var(&self.filter_env_var)
            .ok()
            .and_then(|log_filter| match log_filter.parse::<Filter>() {
                Ok(targets) => Some(targets),
                Err(e) => {
                    eprintln!(
                        "failed to parse filter environment variable `{}={:?}`: {}",
                        self.filter_env_var, log_filter, e
                    );
                    None
                }
            })
            .unwrap_or_else(|| {
                "error"
                    .parse::<Filter>()
                    .expect("`error` filter should always parse successfully")
            });

        tracing_subscriber::registry()
            .with(tracing_subscriber::fmt::layer().with_filter(fmt_filter.clone()))
            .with(layer.with_filter(tracing_subscriber::filter::LevelFilter::DEBUG))
            .try_init()?;

        Ok(())
    }
}
