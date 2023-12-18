use crate::{Command, Watcher};
pub use devtools_wire_format as wire;
use devtools_wire_format::instrument;
use devtools_wire_format::instrument::instrument_server::InstrumentServer;
use devtools_wire_format::instrument::{instrument_server, InstrumentRequest};
use devtools_wire_format::meta::metadata_server;
use devtools_wire_format::meta::metadata_server::MetadataServer;
use devtools_wire_format::sources::sources_server::SourcesServer;
use devtools_wire_format::tauri::tauri_server;
use devtools_wire_format::tauri::tauri_server::TauriServer;
use futures::{FutureExt, TryStreamExt};
use http::HeaderValue;
use std::net::SocketAddr;
use tokio::sync::mpsc;
use tonic::codegen::http::Method;
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use tonic::codegen::BoxStream;
use tonic::{Request, Response, Status};
use tonic_health::pb::health_server::{Health, HealthServer};
use tonic_health::server::HealthReporter;
use tonic_health::ServingStatus;
use tower_http::cors::{AllowHeaders, CorsLayer};

/// Default maximum capacity for the channel of events sent from a
/// [`Server`] to each subscribed client.
///
/// When this capacity is exhausted, the client is assumed to be inactive,
/// and may be disconnected.
const DEFAULT_CLIENT_BUFFER_CAPACITY: usize = 1024 * 4;

/// The `gRPC` server that exposes the instrumenting API
pub struct Server(
    tonic::transport::server::Router<tower_layer::Stack<CorsLayer, tower_layer::Identity>>,
);

struct InstrumentService {
    tx: mpsc::Sender<Command>,
    health_reporter: HealthReporter,
}

impl Server {
    pub fn new(
        cmd_tx: mpsc::Sender<Command>,
        mut health_reporter: HealthReporter,
        health_service: HealthServer<impl Health>,
        tauri_server: impl tauri_server::Tauri,
        metadata_server: impl metadata_server::Metadata,
        sources_server: impl wire::sources::sources_server::Sources,
    ) -> Self {
        health_reporter
            .set_serving::<InstrumentServer<InstrumentService>>()
            .now_or_never()
            .unwrap();

        let cors = CorsLayer::new()
            // allow `GET` and `POST` when accessing the resource
            .allow_methods([Method::GET, Method::POST])
            .allow_headers(AllowHeaders::any());

        let cors = if option_env!("__DEVTOOLS_LOCAL_DEVELOPMENT").is_some() {
            cors.allow_origin(tower_http::cors::Any)
        } else {
            cors.allow_origin(HeaderValue::from_str("https://devtools.crabnebula.dev").unwrap())
        };

        let router = tonic::transport::Server::builder()
            .accept_http1(true)
            .layer(cors)
            .add_service(tonic_web::enable(health_service))
            .add_service(tonic_web::enable(InstrumentServer::new(
                InstrumentService {
                    tx: cmd_tx,
                    health_reporter,
                },
            )))
            .add_service(tonic_web::enable(TauriServer::new(tauri_server)))
            .add_service(tonic_web::enable(MetadataServer::new(metadata_server)))
            .add_service(tonic_web::enable(SourcesServer::new(sources_server)));

        Self(router)
    }

    pub async fn run(self, addr: SocketAddr) -> crate::Result<()> {
        tracing::info!("Listening on {}", addr);

        self.0.serve(addr).await?;

        Ok(())
    }
}

impl InstrumentService {
    async fn set_status(&self, status: ServingStatus) {
        let mut r = self.health_reporter.clone();
        r.set_service_status("rs.devtools.instrument.Instrument", status)
            .await;
    }
}

#[tonic::async_trait]
impl instrument_server::Instrument for InstrumentService {
    type WatchUpdatesStream = BoxStream<instrument::Update>;

    async fn watch_updates(
        &self,
        req: Request<InstrumentRequest>,
    ) -> Result<Response<Self::WatchUpdatesStream>, Status> {
        if let Some(addr) = req.remote_addr() {
            tracing::debug!(client.addr = %addr, "starting a new watch");
        } else {
            tracing::debug!(client.addr = %"<unknown>", "starting a new watch");
        }

        // reserve capacity to message the aggregator
        let Ok(permit) = self.tx.reserve().await else {
            self.set_status(ServingStatus::NotServing).await;
            return Err(Status::internal(
                "cannot start new watch, aggregation task is not running",
            ));
        };

        // create output channel and send tx to the aggregator for tracking
        let (tx, rx) = mpsc::channel(DEFAULT_CLIENT_BUFFER_CAPACITY);

        permit.send(Command::Instrument(Watcher { tx }));

        tracing::debug!("watch started");

        let stream = ReceiverStream::new(rx).or_else(|err| async move {
            tracing::error!("Aggregator failed with error {err:?}");

            // TODO set the health service status to NotServing here

            Err(Status::internal("boom"))
        });

        Ok(Response::new(Box::pin(stream)))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use devtools_wire_format::instrument::instrument_server::Instrument;

    #[tokio::test]
    async fn subscription() {
        let (health_reporter, _) = tonic_health::server::health_reporter();
        let (cmd_tx, mut cmd_rx) = mpsc::channel(1);
        let srv = InstrumentService {
            tx: cmd_tx,
            health_reporter,
        };

        let _stream = srv
            .watch_updates(Request::new(InstrumentRequest {
                log_filter: None,
                span_filter: None,
            }))
            .await
            .unwrap();

        let cmd = cmd_rx.recv().await.unwrap();

        assert!(matches!(cmd, Command::Instrument(_)));
    }
}
