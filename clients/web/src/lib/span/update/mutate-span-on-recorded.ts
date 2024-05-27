import type { Span } from "~/lib/connection/monitor";
import type { SpanEvent_Recorded } from "~/lib/proto/spans";

export function mutateSpanOnRecorded(
  span: Span,
  recordedEvent: SpanEvent_Recorded,
) {
  span.fields = [...span.fields, ...recordedEvent.fields];
}
