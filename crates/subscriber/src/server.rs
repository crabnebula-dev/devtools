use std::net::{IpAddr, Ipv4Addr, SocketAddr};

use tokio::sync::mpsc;
use wire::instrument::Interests;

use crate::{Command, Watch};

/// Default maximum capacity for the channel of events sent from a
/// [`Server`] to each subscribed client.
///
/// When this capacity is exhausted, the client is assumed to be inactive,
/// and may be disconnected.
const DEFAULT_CLIENT_BUFFER_CAPACITY: usize = 1024 * 4;

pub struct Server {
    addr: SocketAddr,
    instrument: InstrumentServer,
    application: ApplicationServer,
}

struct InstrumentServer {
    tx: mpsc::Sender<Command>,
}

struct ApplicationServer {
    package_info: tauri::PackageInfo,
}

impl Server {
    pub const DEFAULT_IP: IpAddr = IpAddr::V4(Ipv4Addr::UNSPECIFIED);

    pub const DEFAULT_PORT: u16 = 6669;

    pub(crate) fn new(tx: mpsc::Sender<Command>, package_info: tauri::PackageInfo) -> Self {
        Self {
            addr: SocketAddr::new(Self::DEFAULT_IP, Self::DEFAULT_PORT),
            instrument: InstrumentServer { tx },
            application: ApplicationServer { package_info },
        }
    }

    pub async fn serve(self) -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
        tonic::transport::Server::builder()
            .add_service(wire::instrument::instrument_server::InstrumentServer::new(
                self.instrument,
            ))
            .add_service(
                wire::application::application_server::ApplicationServer::new(self.application),
            )
            .serve(self.addr)
            .await?;

        Ok(())
    }
}

#[tonic::async_trait]
impl wire::instrument::instrument_server::Instrument for InstrumentServer {
    type WatchUpdatesStream =
        tokio_stream::wrappers::ReceiverStream<Result<wire::instrument::Update, tonic::Status>>;

    async fn watch_updates(
        &self,
        req: tonic::Request<wire::instrument::InstrumentRequest>,
    ) -> Result<tonic::Response<Self::WatchUpdatesStream>, tonic::Status> {
        match req.remote_addr() {
            Some(addr) => tracing::debug!(client.addr = %addr, "starting a new watch"),
            None => tracing::debug!(client.addr = %"<unknown>", "starting a new watch"),
        }

        // reserve capacity to message the aggregator
        let permit = self.tx.reserve().await.map_err(|_| {
            tonic::Status::internal("cannot start new watch, aggregation task is not running")
        })?;

        // create output channel and send tx to the aggregator for tracking
        let (tx, rx) = mpsc::channel(DEFAULT_CLIENT_BUFFER_CAPACITY);

        let interests = Interests::from_bits(req.into_inner().interests)
            .ok_or(tonic::Status::invalid_argument("could not parse sources"))?;

        permit.send(Command::Instrument(Watch { tx, interests }));

        tracing::debug!("watch started");

        let stream = tokio_stream::wrappers::ReceiverStream::new(rx);
        Ok(tonic::Response::new(stream))
    }

    async fn update_interests(
        &self,
        _req: tonic::Request<wire::instrument::UpdateInterestsRequest>,
    ) -> Result<tonic::Response<wire::instrument::UpdateInterestsResponse>, tonic::Status> {
        todo!()
    }
}

#[tonic::async_trait]
impl wire::application::application_server::Application for ApplicationServer {
    async fn get_package_info(
        &self,
        _req: tonic::Request<wire::application::GetPackageInfoRequest>,
    ) -> Result<tonic::Response<wire::application::PackageInfo>, tonic::Status> {
        let info = wire::application::PackageInfo {
            name: self.package_info.name.clone(),
            version: self.package_info.version.to_string(),
            authors: self.package_info.authors.to_string(),
            description: self.package_info.description.to_string(),
        };

        Ok(tonic::Response::new(info))
    }
}
