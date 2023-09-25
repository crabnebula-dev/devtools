use super::Config;
use crate::dispatch::noop::NoopDispatcher;

/// A no-operation (noop) configuration for the subscriber.
///
/// This configuration effectively disables tracings functionality.
/// It's useful in scenarios where you might want to have a placeholder
/// configuration that doesn't introduce overhead or perform any real actions.
pub struct NoopConfig {}

impl Config for NoopConfig {
	type Log = ();
	type Span = ();
	type Metadata = ();
	type Dispatcher = NoopDispatcher;
}
