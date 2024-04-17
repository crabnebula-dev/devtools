import type { Span } from "../connection/monitor";

export function computeDurationsFromSpanArray(spans: Span[]) {
  const initDurations = {
    start: Infinity,
    end: -Infinity,
    shortest: Infinity,
    longest: -Infinity,
  };

  return spans.reduce((durations, span: Span) => {
    if (span.createdAt < durations.start) {
      durations.start = span.createdAt;
    }
    if (span.closedAt > durations.end) {
      durations.end = span.closedAt;
    }
    if (span.duration < durations.shortest) {
      durations.shortest = span.duration;
    }
    if (span.duration > durations.longest) {
      durations.longest = span.duration;
    }
    return durations;
  }, initDurations);
}
