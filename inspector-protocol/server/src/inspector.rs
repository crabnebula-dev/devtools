use inspector_protocol_primitives::{AppHandle, AppMetrics, LogEntry, Runtime, SpanEntry};
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;

const DEFAULT_BROADCAST_CAPACITY: usize = 1_000;

/// Builder for the Inspector.
#[derive(Debug, Clone)]
pub struct InspectorBuilder<'a> {
	/// Channel for broadcasting log entries.
	pub logs_channel: Option<broadcast::Sender<Vec<LogEntry<'a>>>>,
	/// Channel for broadcasting spans entries.
	pub spans_channel: Option<broadcast::Sender<Vec<SpanEntry<'a>>>>,
	/// Holds custom metrics.
	pub metrics: Arc<Mutex<AppMetrics>>,
	/// Channels capacity
	pub capacity: usize,
}

impl<'a> Default for InspectorBuilder<'a> {
	fn default() -> Self {
		Self {
			capacity: DEFAULT_BROADCAST_CAPACITY,
			logs_channel: Default::default(),
			spans_channel: Default::default(),
			metrics: Default::default(),
		}
	}
}

impl<'a> InspectorBuilder<'a> {
	/// Initializes a new `InspectorBuilder` with default values.
	pub fn new() -> Self {
		Default::default()
	}

	/// Associates a broadcast channel for log entries.
	pub fn with_logs_channel(mut self, channel: broadcast::Sender<Vec<LogEntry<'a>>>) -> Self {
		self.logs_channel = Some(channel);
		self
	}

	/// Associates a broadcast channel for spans entries.
	pub fn with_spans_channel(mut self, channel: broadcast::Sender<Vec<SpanEntry<'a>>>) -> Self {
		self.spans_channel = Some(channel);
		self
	}

	/// Sets the metrics for the inspector.
	pub fn with_metrics(mut self, metrics: Arc<Mutex<AppMetrics>>) -> Self {
		self.metrics = metrics;
		self
	}

	/// Sets the broadcast and mpsc channels capacity for the inspector.
	pub fn with_capacity(mut self, capacity: usize) -> Self {
		self.capacity = capacity;
		self
	}

	/// Constructs an `Inspector` from the builder.
	pub fn build<R: Runtime>(self, app_handle: &AppHandle<R>) -> Inspector<'a, R> {
		Inspector {
			app_handle: Arc::new(app_handle.clone()),
			channels: InspectorChannels {
				logs: self.logs_channel.unwrap_or(broadcast::channel(self.capacity).0),
				spans: self.spans_channel.unwrap_or(broadcast::channel(self.capacity).0),
			},
			metrics: self.metrics,
		}
	}
}

/// Represents an inspector which monitors app activities and logs.
#[derive(Debug, Clone)]
pub struct Inspector<'a, R: Runtime> {
	app_handle: Arc<AppHandle<R>>,
	metrics: Arc<Mutex<AppMetrics>>,
	channels: InspectorChannels<'a>,
}

impl<'a, R: Runtime> Inspector<'a, R> {
	/// Return `logs` Receiver. Used to link with WebSocket.
	pub fn logs(&self) -> broadcast::Receiver<Vec<LogEntry<'a>>> {
		self.channels.logs.subscribe()
	}

	/// Return `spans` Receiver. Used to link with WebSocket.
	pub fn spans(&self) -> broadcast::Receiver<Vec<SpanEntry<'a>>> {
		self.channels.spans.subscribe()
	}

	/// Internal metrics
	pub fn metrics(&self) -> &Mutex<AppMetrics> {
		self.metrics.as_ref()
	}

	/// Tauri application handle.
	pub fn app_handle(&self) -> &AppHandle<R> {
		self.app_handle.as_ref()
	}
}

/// Holds the communication channels for the inspector.
#[derive(Debug, Clone)]
pub struct InspectorChannels<'a> {
	logs: broadcast::Sender<Vec<LogEntry<'a>>>,
	spans: broadcast::Sender<Vec<SpanEntry<'a>>>,
}

#[cfg(test)]
mod tests {
	use super::{AppMetrics, InspectorBuilder, DEFAULT_BROADCAST_CAPACITY};
	use inspector_protocol_primitives::now;

	#[test]
	fn inspector_metrics_initialized_at() {
		assert_eq!(AppMetrics::default().initialized_at, now())
	}

	#[test]
	fn inspector_builder_default_capacity() {
		assert_eq!(InspectorBuilder::default().capacity, DEFAULT_BROADCAST_CAPACITY)
	}
}
