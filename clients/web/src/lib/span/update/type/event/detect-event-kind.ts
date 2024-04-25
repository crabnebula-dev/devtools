import type { Span, EventKind } from "~/lib/connection/monitor";

const eventTypes = [
  {
    type: "global event",
    names: new Set([
      "app::emit",
      "app::emit::all",
      "app::emit::filter",
      "app::emit::to",
      "app::emit::rust",
    ]),
  },
  {
    type: "rust event",
    names: new Set(["window::trigger"]),
  },
  {
    type: "event",
    names: new Set(["window::emit", "window::emit::to", "window::emit::all"]),
  },
] as const;

export function detectEventKind(span: Span): EventKind | undefined {
  if (!span.metadata?.name) return;

  for (const eventType of eventTypes) {
    if (eventType.names.has(span.metadata.name)) {
      return eventType.type;
    }
  }
}
