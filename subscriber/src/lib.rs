use inspector_protocol_primitives::LogEntry;
use std::time::Instant;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;
use tokio::sync::broadcast;
use tracing_core::Interest;
use tracing_core::Subscriber;
use tracing_subscriber::registry::LookupSpan;
use visitor::Field;
use visitor::FieldValue;
use visitor::FieldVisitor;

mod visitor;

// Macro to extract fields from tracing data.
// This macro checks if the provided field's value
// is of type Debug or String, and if so, assigns it
// to the provided variable.
macro_rules! extract_field {
    ($field_value:expr, $maybe_value:expr) => {
        match $field_value {
            FieldValue::Debug(v) | FieldValue::Str(v) => {
                $maybe_value = Some(v);
            }
            _ => {}
        }
    };

    ($field_value:expr, $maybe_value:expr, $modifier:expr) => {
        match $field_value {
            FieldValue::Debug(v) | FieldValue::Str(v) => {
                $maybe_value = $modifier(v);
            }
            _ => {}
        }
    };
}

/// Tracing event
#[derive(Debug, Clone)]
pub enum Event {
    // Tracing metadata
    Metadata(&'static tracing_core::Metadata<'static>),
    // Detailed log event
    LogEvent {
        metadata: &'static tracing_core::Metadata<'static>,
        fields: Vec<Field>,
        at: Instant,
    },
}

/// A custom layer that extends the functionality of `tracing_subscriber`
/// by providing the ability to send logs to a broadcast channel.
///
/// This layer is responsible for transforming internal tracing events
/// and sending them to the Websocket broadcast channel.
///
/// ## Important
/// Currently only supports `Logs` but we should add another layer
/// for the call stack / span handling.
pub struct SubscriptionLayer {
    logs_channel: broadcast::Sender<LogEntry>,
}

impl SubscriptionLayer {
    /// Create new `SubscriptionLayer`.
    pub fn new(logs_channel: broadcast::Sender<LogEntry>) -> Self {
        Self { logs_channel }
    }

    // Broadcast a new `LogEntry` to all subscribers (websocket).
    fn broadcast_log(&self, entry: LogEntry) {
        // Ignore all errors (closed channel)
        // FIXME: Maybe we could see if we can do a better job here.
        let _ = self.logs_channel.send(entry);
    }
}

impl<S> tracing_subscriber::Layer<S> for SubscriptionLayer
where
    S: Subscriber + for<'a> LookupSpan<'a>,
{
    // New event (log)
    fn on_event(
        &self,
        event: &tracing_core::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        // FIXME: could be better
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();

        let metadata = event.metadata();

        let mut field_visitor = FieldVisitor::default();
        event.record(&mut field_visitor);
        let fields = field_visitor.result();

        let level = metadata.level().to_string();
        let mut maybe_message = None;
        let mut maybe_target = None;
        let mut maybe_module_path = None;
        let mut maybe_file = None;
        let mut maybe_line = None;

        for field in fields {
            match field.name.as_str() {
                "message" => {
                    extract_field!(field.value, maybe_message);
                }
                "log.target" => {
                    extract_field!(field.value, maybe_target);
                }
                "log.module_path" => {
                    extract_field!(field.value, maybe_module_path);
                }
                "log.file" => {
                    extract_field!(field.value, maybe_file);
                }
                "log.line" => {
                    extract_field!(field.value, maybe_line, |v: String| v.parse::<u64>().ok())
                }

                _ => {}
            }
        }

        if let (Some(message), Some(target), Some(module_path), Some(file), Some(line)) = (
            maybe_message,
            maybe_target,
            maybe_module_path,
            maybe_file,
            maybe_line,
        ) {
            self.broadcast_log(LogEntry {
                timestamp,
                message,
                target,
                level,
                module_path,
                file,
                line,
            })
        }
    }

    fn register_callsite(
        &self,
        _meta: &'static tracing_core::Metadata<'static>,
    ) -> tracing_core::Interest {
        // TODO: track new callsite
        Interest::always()
    }

    fn on_new_span(
        &self,
        _attrs: &tracing_core::span::Attributes<'_>,
        _id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        // TODO: track new span with the given `Attributes` and `Id`.
    }

    fn on_enter(
        &self,
        _id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        // TODO: track span enter
    }

    fn on_exit(
        &self,
        _id: &tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        // TODO: track span exit
    }

    fn on_close(
        &self,
        _id: tracing_core::span::Id,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        // TODO: track span close
    }
}
