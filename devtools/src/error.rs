#[derive(Debug, thiserror::Error)]
pub enum Error {
	#[error(transparent)]
	Io(#[from] std::io::Error),

	#[error(transparent)]
	TryInitError(#[from] tracing_subscriber::util::TryInitError),

	#[error(transparent)]
	JsonError(#[from] serde_json::Error),

	#[error(transparent)]
	Tonic(#[from] tonic::transport::Error),

	#[error(transparent)]
	RelativizePathError(#[from] std::path::StripPrefixError),
}
