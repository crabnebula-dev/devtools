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
use hyper::Body;
use std::net::SocketAddr;
use std::pin::Pin;
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll};
use tokio::sync::mpsc;
use tonic::body::BoxBody;
use tonic::codegen::http::Method;
use tonic::codegen::tokio_stream::wrappers::ReceiverStream;
use tonic::codegen::BoxStream;
use tonic::{Request, Response, Status};
use tonic_health::pb::health_server::{Health, HealthServer};
use tonic_health::server::HealthReporter;
use tonic_health::ServingStatus;
use tower::Service;
use tower_http::cors::{AllowHeaders, AllowOrigin, CorsLayer};
use tower_layer::Layer;

/// Default maximum capacity for the channel of events sent from a
/// [`Server`] to each subscribed client.
///
/// When this capacity is exhausted, the client is assumed to be inactive,
/// and may be disconnected.
const DEFAULT_CLIENT_BUFFER_CAPACITY: usize = 1024 * 4;

/// The `gRPC` server that exposes the instrumenting API
pub struct Server {
    router: tonic::transport::server::Router<
        tower_layer::Stack<DynamicCorsLayer, tower_layer::Identity>,
    >,
    handle: ServerHandle,
}

/// A handle to a server that is allowed to modify its properties (such as CORS allowed origins)
#[allow(clippy::module_name_repetitions)]
#[derive(Clone)]
pub struct ServerHandle {
    allowed_origins: Arc<Mutex<Vec<HeaderValue>>>,
}

impl ServerHandle {
    /// Allow the given origin in the instrumentation server CORS.
    #[allow(clippy::missing_panics_doc)]
    pub fn allow_origin(&self, origin: HeaderValue) {
        self.allowed_origins.lock().unwrap().push(origin);
    }
}

struct InstrumentService {
    tx: mpsc::Sender<Command>,
    health_reporter: HealthReporter,
}

#[derive(Clone)]
struct DynamicCorsLayer {
    allowed_origins: Arc<Mutex<Vec<HeaderValue>>>,
}

impl<S> Layer<S> for DynamicCorsLayer {
    type Service = DynamicCors<S>;

    fn layer(&self, service: S) -> Self::Service {
        DynamicCors {
            inner: service,
            allowed_origins: self.allowed_origins.clone(),
        }
    }
}

#[derive(Debug, Clone)]
struct DynamicCors<S> {
    inner: S,
    allowed_origins: Arc<Mutex<Vec<HeaderValue>>>,
}

type BoxFuture<'a, T> = Pin<Box<dyn std::future::Future<Output = T> + Send + 'a>>;

impl<S> Service<hyper::Request<Body>> for DynamicCors<S>
where
    S: Service<hyper::Request<Body>, Response = hyper::Response<BoxBody>> + Clone + Send + 'static,
    S::Future: Send + 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = BoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: hyper::Request<Body>) -> Self::Future {
        let allowed_origins = self.allowed_origins.lock().unwrap().clone();
        let cors = CorsLayer::new()
            // allow `GET` and `POST` when accessing the resource
            .allow_methods([Method::GET, Method::POST])
            .allow_headers(AllowHeaders::any())
            .allow_origin(if allowed_origins.iter().any(|o| o == "*") {
                AllowOrigin::any()
            } else {
                AllowOrigin::list(allowed_origins)
            });

        Box::pin(cors.layer(self.inner.clone()).call(req))
    }
}

impl Server {
    #[allow(clippy::missing_panics_doc)]
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
            .now_or_never();

        let allowed_origins = Arc::new(Mutex::new(
            if option_env!("__DEVTOOLS_LOCAL_DEVELOPMENT").is_some() {
                vec![HeaderValue::from_str("*").unwrap()]
            } else {
                vec![
                    HeaderValue::from_str("https://devtools.crabnebula.dev").unwrap(),
                    HeaderValue::from_str("tauri://localhost").unwrap(),
                    #[cfg(windows)]
                    HeaderValue::from_str("http://tauri.localhost").unwrap(),
                ]
            },
        ));

        let router = tonic::transport::Server::builder()
            .accept_http1(true)
            .layer(DynamicCorsLayer {
                allowed_origins: allowed_origins.clone(),
            })
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

        Self {
            router,
            handle: ServerHandle { allowed_origins },
        }
    }

    #[must_use]
    pub fn handle(&self) -> ServerHandle {
        self.handle.clone()
    }

    /// Consumes this [`Server`] and returns a future that will execute the server.
    ///
    /// # Errors
    ///
    /// This function fails if the address is already in use or if we fail to start the server.
    pub async fn run(self, addr: SocketAddr) -> crate::Result<()> {
        tracing::info!("Listening on {}", addr);

        self.router.serve(addr).await?;

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
