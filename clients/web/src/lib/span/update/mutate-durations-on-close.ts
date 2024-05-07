import type { Span } from "~/lib/connection/monitor";
import type { Durations } from "~/lib/connection/monitor";

export function mutateDurationsOnClose(span: Span, durations: Durations) {
  if (span.closedAt > durations.end) durations.end = span.closedAt;
  if (!durations.shortestTime || span.duration < durations.shortestTime)
    durations.shortestTime = span.duration;
  if (!durations.longestTime || span.duration > durations.longestTime)
    durations.longestTime = span.duration;

  if (span.kind || !span.parent) {
    durations.average =
      (durations.average * durations.counted + span.duration) /
      (durations.counted + 1);
    durations.counted++;
  }

  durations.openSpans--;
}
