use inspector_protocol_primitives::{InspectorBuilder, InternalEvent};
use inspector_protocol_subscriber::SubscriptionLayer;
use std::{
    fmt,
    net::SocketAddr,
    time::{SystemTime, UNIX_EPOCH},
};
pub use tauri::Result;
use tauri::{plugin::TauriPlugin, RunEvent, Runtime};

use tracing_subscriber::{filter, prelude::*, Layer};

// Constant flag that determines whether the inspector protocol
// should be active or not.
const INSPECT_FLAG: &str = "--inspect";

/// Builder for the Inspector Protocol. Allows setting various attributes for the protocol.
#[derive(Clone, Default)]
pub struct InspectorProtocolBuilder {
    /// The attributes to use to create the inspector protocol.
    pub inspector_protocol: InspectorProtocolAttributes,
}

impl fmt::Debug for InspectorProtocolBuilder {
    fn fmt(&self, fmtr: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmtr.debug_struct("InspectorProtocolBuilder")
            .field("InspectorProtocol", &self.inspector_protocol)
            .finish()
    }
}

/// Attributes to use when creating an inspector protocol.
#[derive(Debug, Clone, Default)]
pub struct InspectorProtocolAttributes {
    socket_addr: Option<SocketAddr>,
}

impl InspectorProtocolBuilder {
    /// Initializes a new `InspectorProtocolBuilder` with default values.
    #[inline]
    pub fn new() -> Self {
        Default::default()
    }

    /// Sets the port for the inspector protocol.
    #[inline]
    pub fn with_port(mut self, port: u16) -> Self {
        self.inspector_protocol.socket_addr = Some(([127, 0, 0, 1], port).into());
        self
    }

    /// Builds the inspector protocol and returns a Tauri Plugin.
    ///
    /// This method checks for the `--inspect` flag.
    #[inline]
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
            return tauri::plugin::Builder::new("inspector-protocol").build();
        }

        // FIXME: validate channel size
        let (internal_channel_sender, mut internal_channel_receiver) =
            tokio::sync::mpsc::channel(10_000);

        let isolated_internal_channel_sender = internal_channel_sender.clone();
        tauri::plugin::Builder::new("inspector-protocol")
            .setup(|app| {
                // Tauri app handler
                let app = app.clone();
                // Build our inspector (with our app handler)
                let inspector = inspector
                    .with_internal_channel(internal_channel_sender)
                    .build(app.clone(), 10_000);
                // Grab the metrics mutex
                let metrics = inspector.metrics.clone();

                // Watch `InternalEvent`
                tauri::async_runtime::spawn(async move {
                    // Continuously listen for internal events.
                    while let Some(internal_event) = internal_channel_receiver.recv().await {
                        match internal_event {
                            // When the application signals it's ready,
                            // capture the current time and record it in metrics.
                            InternalEvent::AppReady => {
                                // Attempt to lock the metrics for updating.
                                if let Ok(mut metrics) = metrics.try_lock() {
                                    metrics.ready_at = SystemTime::now()
                                        .duration_since(UNIX_EPOCH)
                                        .unwrap_or_default()
                                        .as_millis();
                                }
                            }
                        }
                    }
                });

                // Run WebSocket JSON-RPC server
                tauri::async_runtime::spawn(async move {
                    let logs_channel = inspector.channels.logs.clone();

                    // Set up a tracing subscriber to capture log events.
                    // This subscriber filters for TRACE level logs, but excludes
                    // logs originating from `soketto` to reduce noise.
                    tracing_subscriber::registry()
                        .with(
                            SubscriptionLayer::new(logs_channel)
                                .with_filter(tracing_subscriber::filter::LevelFilter::TRACE)
                                .with_filter(filter::filter_fn(|metadata| {
                                    // FIXME: skip `soketto` as it's the main websocket layer
                                    // and create lot of noise
                                    !metadata.target().starts_with("soketto")
                                })),
                        )
                        .init();

                    // Start the inspector protocol server.
                    if let Ok((server_addr, server_handle)) =
                        inspector_protocol_server::start_server(inspector, Default::default()).await
                    {
                        println!("--------- Tauri Inspector Protocol ---------\n");
                        println!("Listening at:\n  ws://{server_addr}\n",);
                        println!(
                            "Inspect in browser:\n  https://crabnebula.dev/debug/#{server_addr}"
                        );
                        println!("\n--------- Tauri Inspector Protocol ---------");

                        // wait for the server to stop
                        server_handle.stopped().await
                    }
                });
                Ok(())
            })
            .on_page_load(|window, payload| {
                log::trace!("Loaded URL {} in window {}", payload.url(), window.label());
            })
            .on_webview_ready(|window| {
                log::trace!("webview ready for {}", window.label());
            })
            .on_event(move |_app, event| match event {
                RunEvent::Ready => {
                    // FIXME: Maybe handle error?
                    if let Err(err) = tauri::async_runtime::block_on(
                        isolated_internal_channel_sender.send(InternalEvent::AppReady),
                    ) {
                        log::error!("{err}");
                    }
                    log::trace!("application is ready");
                }
                RunEvent::Exit => {
                    log::trace!("event loop is exiting");
                }
                RunEvent::WindowEvent { label, event, .. } => {
                    log::trace!("window {} received an event: {:?}", label, event);
                }
                RunEvent::ExitRequested { .. } => {
                    log::trace!("exit requested");
                }
                RunEvent::Resumed => {
                    log::trace!("event loop is being resumed");
                }
                _ => {}
            })
            .build()
    }
}
