use std::net::SocketAddr;

use tokio::sync::mpsc;
use wire::instrument::Interests;

use crate::{Command, Watch};

pub(crate) struct Server {
    instrument: InstrumentServer,
}

struct InstrumentServer {
    commands: mpsc::Sender<Command>,
    client_buffer_capacity: usize,
}

impl Server {
    pub fn new(commands: mpsc::Sender<Command>, client_buffer_capacity: usize) -> Self {
        Self {
            instrument: InstrumentServer {
                commands,
                client_buffer_capacity,
            },
        }
    }

    pub async fn run(self, addr: SocketAddr) -> crate::Result<()> {
        println!("Listening on {}", addr);
        tonic::transport::Server::builder()
            .add_service(wire::instrument::instrument_server::InstrumentServer::new(
                self.instrument,
            ))
            .serve(addr)
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
        let permit = self.commands.reserve().await.map_err(|_| {
            tonic::Status::internal("cannot start new watch, aggregation task is not running")
        })?;

        // create output channel and send tx to the aggregator for tracking
        let (tx, rx) = mpsc::channel(self.client_buffer_capacity);

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
