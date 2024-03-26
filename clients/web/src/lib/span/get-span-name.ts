import { getEventName } from "./get-event-name";
import { getIpcRequestName } from "./get-ipc-request-name";
import type { Span } from "../connection/monitor";

export function getSpanName(span: Span) {
  if (span.kind === "ipc") {
    return getIpcRequestName(span);
  } else if (span.kind === "event") {
    return getEventName(span);
  } else if (span.kind === undefined) {
    return span.metadata?.name ?? null;
  } else {
    return "not implemented";
  }
}
