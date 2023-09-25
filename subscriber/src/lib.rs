//! # Tracing Subscriber with Generic Dispatching
//!
//! This crate provides a specialized subscriber for the `tracing` ecosystem, focusing
//! on flexible and extensible event dispatching.
//!
//! The core idea behind this subscriber is to provide an abstraction over various event "dispatchers."
//! A dispatcher's role is to determine how to handle or process the tracing events it receives.
//!
//! This design allows for the creation and integration of custom dispatch mechanisms tailored to specific needs.
//!
//! ## Built-in Dispatchers
//!
//! Out of the box, this crate comes with a few built-in [Dispatcher]:
//!
//! - `NoopDispatcher`: As the name suggests, this dispatcher does nothing with the events
//! it receives. It serves as a placeholder or default when no active dispatching is required.
//!
//! - `BroadcastDispatcher`: This dispatcher takes incoming tracing events and broadcasts them
//! using a Tokio channel. Designed with real-time data streaming in mind, it can be coupled with
//! a WebSocket RPC server, allowing clients to receive and react to tracing events in real-time.
//!

pub mod config;
pub mod dispatch;
pub mod error;
pub mod layer;
pub mod subscriber;
mod visitor;

// Expose a few of the most common types at root,
// but leave most types behind their respective modules.
pub use crate::{dispatch::broadcast::BroadcastConfig, subscriber::SubscriberBuilder};

/// Returns a [`SubscriberBuilder`] that is initialized with a [`NoopDispatcher`].
///
/// This function is useful when you want to have tracing integrated
/// but with no-op behavior, meaning it does not actually dispatch or
/// handle the tracing events.
pub fn noop() -> SubscriberBuilder<config::NoopConfig> {
	SubscriberBuilder::new(dispatch::NoopDispatcher::new())
}

/// Returns a [`SubscriberBuilder`] initialized with a [`BroadcastDispatcher`]
/// using the provided configuration.
///
/// This function allows for setting up a subscriber that can broadcast
/// tracing events based on the provided [`BroadcastConfig`].
pub fn broadcast(config: BroadcastConfig<config::BroadcastConfig>) -> SubscriberBuilder<config::BroadcastConfig> {
	SubscriberBuilder::new(dispatch::BroadcastDispatcher::new(config))
}
