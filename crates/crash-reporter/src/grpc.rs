use std::net::SocketAddr;
use tokio::sync::oneshot;

use crate::Watchers;

pub(crate) struct GRPCServer {
    watchers: Watchers,
}

impl GRPCServer {
    pub fn new(watchers: Watchers) -> Self {
        Self { watchers }
    }

    pub async fn run(self, addr: SocketAddr) -> crate::Result<()> {
        tonic::transport::Server::builder()
            .add_service(wire::crash::crash_reporter_server::CrashReporterServer::new(self))
            .serve(addr)
            .await?;

        Ok(())
    }
}

#[tonic::async_trait]
impl wire::crash::crash_reporter_server::CrashReporter for GRPCServer {
    async fn watch_crash(
        &self,
        _req: tonic::Request<wire::crash::WatchCrashRequest>,
    ) -> Result<tonic::Response<wire::crash::CrashReport>, tonic::Status> {
        let (tx, rx) = oneshot::channel();

        let mut watchers = self.watchers.lock().await;
        watchers.push(tx);
        drop(watchers);

        let crashdump = rx.await.unwrap();

        Ok(tonic::Response::new(wire::crash::CrashReport { crashdump }))
    }
}
