#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("todo")]
    IO(#[from] std::io::Error),
    #[error("todo")]
    TryInit(#[from] tracing_subscriber::util::TryInitError),
    #[error("todo")]
    Transport(#[from] tonic::transport::Error),
    #[error("todo")]
    Zeroconf(#[from] mdns_sd::Error),
    #[error("todo")]
    CrashReporter(#[from] crash_reporter::Error),
}
