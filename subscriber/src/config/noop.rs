use super::Config;
use crate::dispatch::noop::NoopDispatcher;

pub struct NoopConfig {}
impl Config for NoopConfig {
	type Log = ();
	type Span = ();
	type Metadata = ();
	type Dispatcher = NoopDispatcher;
}
