import type { Span } from "~/lib/connection/monitor";
import type { SpanEvent_Exit } from "~/lib/proto/spans";
import { convertTimestampToNanoseconds } from "../../formatters";

export function mutateSpanOnExit(span: Span, exitEvent: SpanEvent_Exit) {
  const exitedAt = exitEvent.at
    ? convertTimestampToNanoseconds(exitEvent.at)
    : -1;
  span.exits.push({
    timestamp: exitedAt,
    threadID: Number(exitEvent.threadId),
  });
}
