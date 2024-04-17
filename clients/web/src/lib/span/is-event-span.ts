import { Span } from "../connection/monitor";

const emitSpanNames = [
  "app::emit::all",
  "app::emit::filter",
  "app::emit::to",
  "app::emit::rust",
  "window::emit",
  "window::trigger",
  "window::emit::to",
  "window::emit::all",
];

export function isEventSpan(span: Span) {
  return emitSpanNames.includes(span.metadata?.name ?? "");
}
