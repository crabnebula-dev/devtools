use std::{sync::Arc, net::{SocketAddr, Ipv4Addr, IpAddr}};

use bytes::Bytes;
use tokio::sync::{Mutex, oneshot};

pub struct GRPCServer {
    // TODO this is horrific
    watchers: Arc<Mutex<Vec<oneshot::Sender<Bytes>>>>,
}

impl GRPCServer {
    pub fn new(watchers: Arc<Mutex<Vec<oneshot::Sender<Bytes>>>>) -> Self {
        Self { watchers }
    }

    pub async fn serve(self) -> crate::Result<()> {
        tonic::transport::Server::builder()
            .add_service(wire::crash::crash_handler_server::CrashHandlerServer::new(
                self,
            ))
            .serve(SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 6668))
            .await?;

        Ok(())
    }
}

#[tonic::async_trait]
impl wire::crash::crash_handler_server::CrashHandler for GRPCServer {
    /// This call will resolve with information about the crash when a it happens
    async fn watch_crash(
        &self,
        _req: tonic::Request<wire::crash::WatchCrashRequest>,
    ) -> Result<tonic::Response<wire::crash::WatchCrashResponse>, tonic::Status> {
        let (tx, rx) = oneshot::channel();

        let mut watchers = self.watchers.lock().await;
        watchers.push(tx);
        drop(watchers);

        let crashdump = rx.await.unwrap();

        Ok(tonic::Response::new(wire::crash::WatchCrashResponse { crashdump }))
    }
}