import type { Span, EventKind } from "~/lib/connection/monitor";
import { EventKinds } from "./event-spans";

export function detectEventKind(span: Span): EventKind | undefined {
  if (!span.metadata?.name) return;

  for (const eventKind of EventKinds) {
    if (eventKind.names.has(span.metadata.name)) {
      return eventKind.type;
    }
  }
}
