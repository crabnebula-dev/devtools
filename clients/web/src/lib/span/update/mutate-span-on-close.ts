import type { Span } from "~/lib/connection/monitor";
import type { SpanEvent_Close } from "~/lib/proto/spans";
import { convertTimestampToNanoseconds } from "../../formatters";

export function mutateSpanOnClose(span: Span, closeEvent: SpanEvent_Close) {
  span.closedAt = closeEvent.at
    ? convertTimestampToNanoseconds(closeEvent.at)
    : -1;
  span.duration = span.closedAt - span.createdAt;

  span.isProcessing = span.closedAt < 0;

  span.time = !span.isProcessing
    ? span.duration / 1e6
    : Date.now() - span.createdAt / 1e6;
}
