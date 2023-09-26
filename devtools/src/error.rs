#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    TryInitError(#[from] tracing_subscriber::util::TryInitError),

    #[error(transparent)]
    RpcError(#[from] jsonrpsee_core::Error),

    #[error(transparent)]
    BroadcastStreamRecvError(#[from] tokio_stream::wrappers::errors::BroadcastStreamRecvError),

    #[error(transparent)]
    JsonError(#[from] serde_json::Error),

    #[error(transparent)]
    PendingSubscriptionAcceptError(#[from] jsonrpsee_core::server::PendingSubscriptionAcceptError),
}