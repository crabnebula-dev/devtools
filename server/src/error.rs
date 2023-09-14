use jsonrpsee::PendingSubscriptionAcceptError;
use tokio_stream::wrappers::errors::BroadcastStreamRecvError;

/// Inspector protocol Result typedef.
pub type Result<T, E = Error> = std::result::Result<T, E>;

/// Inspector protocol errors.
#[derive(Debug, thiserror::Error)]
#[allow(missing_docs)]
#[non_exhaustive]
pub enum Error {
	#[error(transparent)]
	Io(#[from] std::io::Error),

	#[error(transparent)]
	RpcError(#[from] jsonrpsee_core::Error),

	#[error(transparent)]
	ErrorCode(#[from] jsonrpsee::types::error::ErrorCode),

	#[error(transparent)]
	BroadcastStreamRecvError(#[from] BroadcastStreamRecvError),

	#[error(transparent)]
	JsonError(#[from] serde_json::Error),

	#[error(transparent)]
	PendingSubscriptionAcceptError(#[from] PendingSubscriptionAcceptError),

	#[error("Other: {0}")]
	Other(String),
}

impl<'a> From<&'a str> for Error {
	fn from(s: &'a str) -> Self {
		Error::Other(s.into())
	}
}

impl From<String> for Error {
	fn from(s: String) -> Self {
		Error::Other(s)
	}
}
