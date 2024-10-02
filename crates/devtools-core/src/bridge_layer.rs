use std::str::FromStr;

use tracing_subscriber::layer::Context;

use crate::visitors::EventVisitor;

pub struct BridgeLayer {
    loggers: Vec<Box<dyn log::Log>>,
}

impl BridgeLayer {
    #[must_use]
    pub fn new(loggers: Vec<Box<dyn log::Log>>) -> Self {
        Self { loggers }
    }

    pub fn add_logger(&mut self, logger: Box<dyn log::Log>) {
        self.loggers.push(logger);
    }
}

impl<S> tracing_subscriber::layer::Layer<S> for BridgeLayer
where
    S: tracing_core::Subscriber + for<'a> tracing_subscriber::registry::LookupSpan<'a>,
{
    fn on_event(&self, event: &tracing_core::Event<'_>, _ctx: Context<'_, S>) {
        let metadata = event.metadata();

        let mut visitor = EventVisitor::new(std::ptr::from_ref(metadata) as u64);
        event.record(&mut visitor);
        let (message, _fields) = visitor.result();

        if let Some(message) = message {
            for logger in &self.loggers {
                logger.log(
                    &log::Record::builder()
                        .level(log::Level::from_str(metadata.level().as_str()).unwrap())
                        .target(metadata.target())
                        .file(metadata.file())
                        .line(metadata.line())
                        .module_path(metadata.module_path())
                        .args(format_args!("{message}"))
                        .build(),
                );
            }
        }
    }
}
