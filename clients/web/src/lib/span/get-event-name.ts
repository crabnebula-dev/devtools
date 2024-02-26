import { isEventSpan } from "./is-event-span";
import { processFieldValue } from "./process-field-value";
import type { Span } from "../connection/monitor";

export function getEventName(span: Span) {
  const name = span.metadata?.name ?? null;
  if (isEventSpan(span)) {
    const eventField = span.fields.find((f) => f.name === "event");
    if (eventField) {
      const kind = name?.startsWith("app::")
        ? "global event"
        : name === "window::trigger"
        ? "rust event"
        : "event";
      return `${kind}: ${processFieldValue(eventField.value)}`;
    }
  }
  return name;
}
