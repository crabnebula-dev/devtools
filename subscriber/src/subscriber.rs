use crate::{
	dispatch::{Dispatcher, NoopDispatcher},
	Layer, Result,
};
use std::any::TypeId;
use tracing_core::{span, Event, Interest, LevelFilter, Metadata};
use tracing_subscriber::registry::LookupSpan;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{layer, Layer as _, Registry};

/// A type alias for the [`layer::Layered`] used in the Subscriber.
pub type Layered<T> = layer::Layered<Layer<T>, Registry>;

/// Subscriber for tracing, built on top of a [`Dispatcher`] and potentially a [`LevelFilter`].
pub struct Subscriber<T = NoopDispatcher, F = LevelFilter>
where
	T: Dispatcher<'static>,
{
	inner: layer::Layered<F, Layered<T>>,
}

impl<T> Subscriber<T>
where
	T: Dispatcher<'static> + Send + Sync + 'static,
	Layer<T>: layer::Layer<Registry> + Send + Sync + 'static,
{
	/// Default maximum level for the subscriber.
	pub const DEFAULT_MAX_LEVEL: LevelFilter = LevelFilter::INFO;

	/// Create a new subscriber with the given inner layer.
	pub fn new(inner: layer::Layered<LevelFilter, Layered<T>>) -> Self {
		Self { inner }
	}

	/// Get a [`SubscriberBuilder`] for the `Subscriber` using the provided dispatcher.
	pub fn builder(dispatcher: T) -> SubscriberBuilder<T> {
		SubscriberBuilder::new(dispatcher)
	}

	/// Attempts to set `self` as the global default subscriber in the current
	/// scope, returning an error if one is already set.
	///
	/// This method returns an error if a global default subscriber has already
	/// been set.
	pub fn try_init(self) -> Result<()> {
		self.inner.try_init()?;
		Ok(())
	}

	/// Attempts to set `self` as the global default subscriber in the current
	/// scope, panicking if this fails.
	///
	/// This method panics if a global default subscriber has already been set.
	pub fn init(self) {
		self.inner.init()
	}
}

impl<T: Dispatcher<'static> + 'static> tracing_core::Subscriber for Subscriber<T> {
	#[inline]
	fn register_callsite(&self, meta: &'static Metadata<'static>) -> Interest {
		self.inner.register_callsite(meta)
	}

	#[inline]
	fn enabled(&self, meta: &Metadata<'_>) -> bool {
		self.inner.enabled(meta)
	}

	#[inline]
	fn new_span(&self, attrs: &span::Attributes<'_>) -> span::Id {
		self.inner.new_span(attrs)
	}

	#[inline]
	fn record(&self, span: &span::Id, values: &span::Record<'_>) {
		self.inner.record(span, values)
	}

	#[inline]
	fn record_follows_from(&self, span: &span::Id, follows: &span::Id) {
		self.inner.record_follows_from(span, follows)
	}

	#[inline]
	fn event_enabled(&self, event: &Event<'_>) -> bool {
		self.inner.event_enabled(event)
	}

	#[inline]
	fn event(&self, event: &Event<'_>) {
		self.inner.event(event);
	}

	#[inline]
	fn enter(&self, id: &span::Id) {
		// TODO: add on_enter hook
		self.inner.enter(id);
	}

	#[inline]
	fn exit(&self, id: &span::Id) {
		self.inner.exit(id);
	}

	#[inline]
	fn current_span(&self) -> span::Current {
		self.inner.current_span()
	}

	#[inline]
	fn clone_span(&self, id: &span::Id) -> span::Id {
		self.inner.clone_span(id)
	}

	#[inline]
	fn try_close(&self, id: span::Id) -> bool {
		self.inner.try_close(id)
	}

	#[inline]
	fn max_level_hint(&self) -> Option<tracing_core::LevelFilter> {
		self.inner.max_level_hint()
	}

	unsafe fn downcast_raw(&self, id: TypeId) -> Option<*const ()> {
		if id == TypeId::of::<Self>() {
			Some(self as *const Self as *const ())
		} else {
			self.inner.downcast_raw(id)
		}
	}
}

impl<'a, F, T> LookupSpan<'a> for Subscriber<T, F>
where
	T: Dispatcher<'static> + 'static,
{
	type Data = <layer::Layered<F, Layered<T>> as LookupSpan<'a>>::Data;

	fn span_data(&'a self, id: &span::Id) -> Option<Self::Data> {
		self.inner.span_data(id)
	}
}

/// A builder for [`Subscriber`].
pub struct SubscriberBuilder<T, F = LevelFilter>
where
	T: Dispatcher<'static>,
{
	filter: F,
	dispatcher: T,
}

impl<T> SubscriberBuilder<T>
where
	T: Dispatcher<'static> + Send + Sync + 'static,
	Layer<T>: layer::Layer<Registry> + Send + Sync + 'static,
{
	/// Creates a new `SubscriberBuilder` instance with the specified [`Dispatcher`].
	///
	/// # Examples
	///
	/// ```rust
	/// use inspector_protocol_subscriber::{NoopDispatcher, SubscriberBuilder};
	/// let builder = SubscriberBuilder::new(NoopDispatcher::new()).finish();
	/// ```
	pub fn new(dispatcher: T) -> Self {
		SubscriberBuilder {
			dispatcher,
			filter: Subscriber::<T>::DEFAULT_MAX_LEVEL,
		}
	}

	/// Set [`LevelFilter`] for the [`Subscriber`].
	pub fn with_max_level(mut self, filter: impl Into<LevelFilter>) -> Self {
		self.filter = filter.into();
		self
	}

	/// Generate the [`Subscriber`] from the builder.
	pub fn finish(self) -> Subscriber<T> {
		let subscriber = Layer::<T>::builder(self.dispatcher)
			.build()
			.with_subscriber(Registry::default());
		Subscriber::new(self.filter.with_subscriber(subscriber))
	}

	/// Attempts to set `self` as the global default subscriber in the current
	/// scope, returning an error if one is already set.
	///
	/// This method returns an error if a global default subscriber has already
	/// been set.
	pub fn try_init(self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
		self.finish().try_init().map_err(Into::into)
	}
}

#[cfg(test)]
mod tests {

	use crate::{dispatch::NoopDispatcher, Subscriber};
	use tracing_core::dispatcher::Dispatch;
	use tracing_core::LevelFilter;
	use tracing_subscriber::registry::LookupSpan;

	#[test]
	fn impls() {
		let subscriber = Subscriber::builder(NoopDispatcher::new()).finish();
		let _dispatch = Dispatch::new(subscriber);
	}

	#[test]
	fn subscriber_downcasts() {
		let subscriber = Subscriber::builder(NoopDispatcher::new()).finish();
		let dispatch = Dispatch::new(subscriber);
		assert!(dispatch.downcast_ref::<Subscriber<NoopDispatcher>>().is_some());
	}

	#[test]
	fn subscriber_downcasts_to_parts() {
		let subscriber = Subscriber::builder(NoopDispatcher::new()).finish();
		let dispatch = Dispatch::new(subscriber);
		assert!(dispatch.downcast_ref::<LevelFilter>().is_some());
	}

	#[test]
	fn is_subscriber() {
		fn assert_subscriber<T: tracing_core::Subscriber>(_: T) {}
		let subscriber = Subscriber::builder(NoopDispatcher::new()).finish();
		assert_subscriber(subscriber)
	}

	#[test]
	fn is_lookup_span() {
		fn assert_lookup_span<T: for<'a> LookupSpan<'a>>(_: T) {}
		let subscriber = Subscriber::builder(NoopDispatcher::new()).finish();
		assert_lookup_span(subscriber)
	}
}
