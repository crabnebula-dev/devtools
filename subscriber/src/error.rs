use tracing_subscriber::util::TryInitError;

/// Inspector protocol Result typedef.
pub type Result<T, E = Error> = std::result::Result<T, E>;

/// Inspector protocol errors.
#[derive(Debug, thiserror::Error)]
#[allow(missing_docs)]
#[non_exhaustive]
pub enum Error {
	#[error(transparent)]
	TryInitError(#[from] TryInitError),
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
