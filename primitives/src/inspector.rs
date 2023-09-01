use crate::{now, AppHandle, InternalEvent, LogEntry, Runtime};
use serde::Serialize;
use std::sync::{Arc, Mutex};
use tokio::sync::{broadcast, mpsc};

/// Builder for the Inspector.
#[derive(Default, Debug, Clone)]
pub struct InspectorBuilder {
	/// Channel for broadcasting log entries.
	pub logs_channel: Option<broadcast::Sender<LogEntry>>,
	/// Channel for sending internal events.
	pub internal_channel: Option<mpsc::Sender<InternalEvent>>,
	/// Holds custom metrics.
	pub metrics: Arc<Mutex<InspectorMetrics>>,
}

impl InspectorBuilder {
	/// Initializes a new `InspectorBuilder` with default values.
	pub fn new() -> Self {
		Default::default()
	}

	/// Associates a broadcast channel for log entries.
	pub fn with_logs_channel(mut self, channel: broadcast::Sender<LogEntry>) -> Self {
		self.logs_channel = Some(channel);
		self
	}

	/// Associates a channel for internal events.
	pub fn with_internal_channel(mut self, channel: mpsc::Sender<InternalEvent>) -> Self {
		self.internal_channel = Some(channel);
		self
	}

	/// Sets the metrics for the inspector.
	pub fn with_metrics(mut self, metrics: Arc<Mutex<InspectorMetrics>>) -> Self {
		self.metrics = metrics;
		self
	}

	/// Constructs an `Inspector` from the builder.
	pub fn build<R: Runtime>(self, app_handle: AppHandle<R>, capacity: usize) -> Inspector<R> {
		Inspector {
			app_handle,
			channels: InspectorChannels {
				internal: self.internal_channel.unwrap_or(mpsc::channel(capacity).0),
				logs: self.logs_channel.unwrap_or(broadcast::channel(capacity).0),
			},
			metrics: self.metrics,
		}
	}
}

/// Represents an inspector which monitors app activities and logs.
#[derive(Debug, Clone)]
pub struct Inspector<R: Runtime> {
	/// Tauri application handle.
	pub app_handle: AppHandle<R>,
	/// Holds the communication channels for the inspector.
	pub channels: InspectorChannels,
	/// Custom metrics.
	pub metrics: Arc<Mutex<InspectorMetrics>>,
}

/// Holds the communication channels for the inspector.
#[derive(Debug, Clone)]
pub struct InspectorChannels {
	pub logs: broadcast::Sender<LogEntry>,
	pub internal: mpsc::Sender<InternalEvent>,
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
