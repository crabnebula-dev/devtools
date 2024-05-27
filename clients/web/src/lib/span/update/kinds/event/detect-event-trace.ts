import type { Span } from "~/lib/connection/monitor";
import { detectEventKind } from "./detect-event-kind";
import { EventData } from "~/lib/connection/monitor";
import { processFieldValue } from "~/lib/span/process-field-value";

export function detectEventTrace(root: Span): EventData | undefined {
  // First we check the root name is one of the expected kinds.
  const kind = detectEventKind(root);
  if (!kind) return;

  const eventField = root.fields.find((f) => f.name === "event");
  if (!eventField) return;

  return {
    kind,
    event: processFieldValue(eventField.value),
  };
}
