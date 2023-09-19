use crate::{now, AppHandle, LogEntry, Runtime, SpanEntry};
use serde::Serialize;
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
	pub metrics: Arc<Mutex<InspectorMetrics>>,
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
	pub fn with_metrics(mut self, metrics: Arc<Mutex<InspectorMetrics>>) -> Self {
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
			app_handle: app_handle.clone(),
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
	/// Tauri application handle.
	pub app_handle: AppHandle<R>,
	/// Holds the communication channels for the inspector.
	pub channels: InspectorChannels<'a>,
	/// Custom metrics.
	pub metrics: Arc<Mutex<InspectorMetrics>>,
}

/// Holds the communication channels for the inspector.
#[derive(Debug, Clone)]
pub struct InspectorChannels<'a> {
	pub logs: broadcast::Sender<Vec<LogEntry<'a>>>,
	pub spans: broadcast::Sender<Vec<SpanEntry<'a>>>,
}

/// Custom metrics.
///
/// These metrics are not inherently provided by Tauri. Instead, they are
/// derived from various events and methods tailored for custom monitoring.
/// This setup offers flexibility, allowing easy extension and addition of
/// more metrics based on future needs.

#[derive(Serialize, Debug, Clone)]
pub struct InspectorMetrics {
	/// Tauri application initialization time
	pub initialized_at: u128,
	/// Tauri applicatin reported `AppReady` time
	pub ready_at: u128,
}

impl Default for InspectorMetrics {
	fn default() -> Self {
		Self {
			initialized_at: now(),
			ready_at: Default::default(),
		}
	}
}

#[cfg(test)]
mod tests {
	use super::DEFAULT_BROADCAST_CAPACITY;
	use crate::{now, InspectorBuilder, InspectorMetrics};

	#[test]
	fn inspector_metrics_initialized_at() {
		assert_eq!(InspectorMetrics::default().initialized_at, now())
	}

	#[test]
	fn inspector_builder_default_capacity() {
		assert_eq!(InspectorBuilder::default().capacity, DEFAULT_BROADCAST_CAPACITY)
	}
}
