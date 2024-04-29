import type { Span } from "~/lib/connection/monitor";
import { detectEventTrace } from "./detect-event-trace";

export function mutateWhenEventTrace(root: Span): boolean {
  const eventData = detectEventTrace(root);
  if (!eventData) return false;
  root.kind = "event";
  root.displayName = `${eventData.kind}: ${eventData.event}`;
  root.eventData = eventData;
  return true;
}
