use inspector_protocol_primitives::{now, AppHandle, EntryT, LogEntry, Runtime, SpanEntry};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;

/// Default broadcast capacity for communication channels.
const DEFAULT_BROADCAST_CAPACITY: usize = 1_000;

/// Builder for creating a monitoring `Context`.
#[derive(Debug, Clone)]
pub struct ContextBuilder<L = LogEntry, S = SpanEntry>
where
	L: EntryT,
	S: EntryT,
{
	/// Channel for broadcasting log entries.
	pub logs_channel: Option<broadcast::Sender<Vec<L>>>,
	/// Channel for broadcasting spans entries.
	pub spans_channel: Option<broadcast::Sender<Vec<S>>>,
	/// Holds custom metrics.
	pub metrics: Arc<Mutex<ContextMetrics>>,
	/// Capacity for broadcast and message-passing channels.
	pub capacity: usize,
}

impl<L, S> Default for ContextBuilder<L, S>
where
	L: EntryT,
	S: EntryT,
{
	fn default() -> Self {
		Self {
			capacity: DEFAULT_BROADCAST_CAPACITY,
			logs_channel: Default::default(),
			spans_channel: Default::default(),
			metrics: Default::default(),
		}
	}
}

impl<L, S> ContextBuilder<L, S>
where
	L: EntryT,
	S: EntryT,
{
	/// Initializes a new `ContextBuilder` with default values.
	pub fn new() -> Self {
		ContextBuilder::default()
	}

	/// Associates a broadcast channel for log entries.
	pub fn with_logs_channel(mut self, channel: broadcast::Sender<Vec<L>>) -> Self {
		self.logs_channel = Some(channel);
		self
	}

	/// Associates a broadcast channel for spans entries.
	pub fn with_spans_channel(mut self, channel: broadcast::Sender<Vec<S>>) -> Self {
		self.spans_channel = Some(channel);
		self
	}

	/// Sets the metrics for the inspector.
	pub fn with_metrics(mut self, metrics: Arc<Mutex<ContextMetrics>>) -> Self {
		self.metrics = metrics;
		self
	}

	/// Sets the broadcast and mpsc channels capacity for the inspector.
	pub fn with_capacity(mut self, capacity: usize) -> Self {
		self.capacity = capacity;
		self
	}

	/// Constructs an `Context` from the builder.
	pub fn build<R: Runtime>(self, app_handle: &AppHandle<R>) -> Context<R, L, S> {
		Context {
			app_handle: app_handle.clone(),
			channels: ContextChannels {
				logs: self.logs_channel.unwrap_or(broadcast::channel(self.capacity).0),
				spans: self.spans_channel.unwrap_or(broadcast::channel(self.capacity).0),
			},
			metrics: self.metrics,
		}
	}
}

/// Represents the diagnostic context of the application.
///
/// `Context` serves as the centralized location for logging, tracing,
/// and metrics-related functionalities. It holds references to Tauri's application handle
/// and communication channels for broadcasting logs and spans.
#[derive(Debug, Clone)]
pub struct Context<R, L, S>
where
	R: Runtime,
	L: EntryT,
	S: EntryT,
{
	/// Tauri application handle.
	pub app_handle: AppHandle<R>,
	/// Holds the communication channels for the inspector.
	pub channels: ContextChannels<L, S>,
	/// Metrics for custom monitoring needs.
	pub metrics: Arc<Mutex<ContextMetrics>>,
}

/// Holds the broadcast channels for logging and tracing.
///
/// This struct bundles together the broadcast channels for disseminating log
/// and span entries across the application. Each channel is parameterized by the
/// corresponding entry type that implements [`EntryT`].
#[derive(Debug, Clone)]
pub struct ContextChannels<L, S>
where
	L: EntryT,
	S: EntryT,
{
	pub logs: broadcast::Sender<Vec<L>>,
	pub spans: broadcast::Sender<Vec<S>>,
}

/// Struct for holding custom diagnostic metrics.
///
/// The `ContextMetrics` struct encapsulates various diagnostic metrics that aren't
/// natively provided by Tauri. These metrics are useful for tracking the performance,
/// reliability, or other custom attributes of the application.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ContextMetrics {
	/// Timestamp indicating when the Tauri application was initialized.
	pub initialized_at: u128,
	/// Timestamp indicating when the Tauri application reported `AppReady`.
	pub ready_at: u128,
}

impl Default for ContextMetrics {
	fn default() -> Self {
		Self {
			initialized_at: now(),
			ready_at: Default::default(),
		}
	}
}

#[cfg(test)]
mod tests {
	use super::{ContextBuilder, ContextMetrics, DEFAULT_BROADCAST_CAPACITY};
	use inspector_protocol_primitives::now;

	#[test]
	fn inspector_metrics_initialized_at() {
		assert_eq!(ContextMetrics::default().initialized_at, now())
	}

	#[test]
	fn inspector_builder_default_capacity() {
		assert_eq!(<ContextBuilder>::new().capacity, DEFAULT_BROADCAST_CAPACITY)
	}
}
