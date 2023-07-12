#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("todo")]
    Io(#[from] std::io::Error),
    #[error("protocol error occurred: {0}")]
    ProtocolError(&'static str),
    #[error("todo")]
    CrashHandlerAttach(#[from] crash_handler::Error),
    #[error("todo")]
    MinidumpWriterError(#[from] minidump_writer::errors::WriterError),
    #[error("todo")]
    Grpc(#[from] tonic::transport::Error),
    #[cfg(target_os = "macos")]
    /// The provided socket name or path was invalid as a Mach port name
    #[error("the mach port name is invalid")]
    InvalidPortName,
    /// An error occurred while creating or communicating with a Mach port
    #[cfg(target_os = "macos")]
    #[error("the mach port name is invalid")]
    PortError(#[from] crash_context::ipc::Error),
}
