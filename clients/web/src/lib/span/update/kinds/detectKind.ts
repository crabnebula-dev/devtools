import type { Span } from "~/lib/connection/monitor";
import { detectEventKind } from "./event/detect-event-kind";
import { detectIpcKind } from "./ipc/detect-ipc-kind";

export function detectKind(span: Span) {
  if (detectEventKind(span)) return "event";
  if (detectIpcKind(span)) return "ipc";
}
