import type { Span } from "~/lib/connection/monitor";
import type { SpanEvent_Enter } from "~/lib/proto/spans";
import { convertTimestampToNanoseconds } from "../../formatters";

export function mutateSpanOnEnter(span: Span, enterEvent: SpanEvent_Enter) {
  const enteredAt = enterEvent.at
    ? convertTimestampToNanoseconds(enterEvent.at)
    : -1;

  span.enters.push({
    timestamp: enteredAt,
    threadID: Number(enterEvent.threadId),
  });
}
