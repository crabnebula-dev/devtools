import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";

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
