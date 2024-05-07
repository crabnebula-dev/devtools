import type { SpanTreeEntry } from "../span/span-tree-entries";

export function computeDurationsFromSpanTreeArray(spans: SpanTreeEntry[]) {
  const initDurations = {
    start: Infinity,
    end: -Infinity,
    shortest: Infinity,
    longest: -Infinity,
  };

  return spans.reduce((durations, entry: SpanTreeEntry) => {
    if (entry.span.createdAt < durations.start) {
      durations.start = entry.span.createdAt;
    }
    if (entry.span.closedAt > durations.end) {
      durations.end = entry.span.closedAt;
    }
    if (entry.span.duration < durations.shortest) {
      durations.shortest = entry.span.duration;
    }
    if (entry.span.duration > durations.longest) {
      durations.longest = entry.span.duration;
    }
    return durations;
  }, initDurations);
}
