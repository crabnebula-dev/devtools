import type { Span } from "~/lib/connection/monitor";
import type { Durations } from "~/lib/connection/monitor";

export function mutateDurationsOnNew(span: Span, durations: Durations) {
  if (!durations.start || span.createdAt < durations.start)
    durations.start = span.createdAt;

  durations.openSpans++;
}
