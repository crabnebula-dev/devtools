import { detectEventKind } from "./update/kinds/event/detect-event-kind";
import { Span } from "../connection/monitor";

export function getSpanKind(span: Span) {
  if (detectEventKind(span)) return "event";

  const ipcNames = ["wry::ipc::handle", "wry::custom_protocol::handle"];

  if (ipcNames.includes(span.name)) return "ipc";
}
