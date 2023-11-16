import { FilteredSpan } from "./types";

function scaleNumbers(numbers: number[], min: number, max: number): number[] {
  const range = max - min;
  return numbers
    .map((num) => ((num - min) / range) * 100)
    .map((num) => Math.max(0, Math.min(num, 100)));
}

function scaleToMax(numbers: number[], max: number): number[] {
  return numbers.map((num) => (num / max) * 100);
}

export function normalizeSpans(spans: FilteredSpan[], granularity = 1) {
  const start = Math.min(...spans.map((span) => span.createdAt));
  const end = spans.find((s) => s.closedAt < 0)
    ? Date.now() * 1e6
    : Math.max(
      ...spans.filter((s) => s.closedAt > 0).map((span) => span.closedAt)
    );
  const totalDuration = end - start;
  const completedSpans = spans.filter((s) => s.closedAt > 0);
  const averageSpanDuration =
    completedSpans.reduce((acc, span) => acc + span.duration, 0) /
    completedSpans.length;
  const relativeDurations = scaleToMax(
    completedSpans.map((s) => s.duration),
    averageSpanDuration
  ).map(Math.ceil);

  const result = spans.map((span, i) => {
    const allExits = span.exits.reduce((acc, e) => acc + e, 0);
    const allEnters = span.enters.reduce((acc, e) => acc + e, 0);
    const relativeDuration = relativeDurations[i];
    const offset = scaleNumbers([span.createdAt], start, end)[0];
    const width = Math.min(
      scaleToMax([span.duration], totalDuration / granularity)[0],
      100 - offset
    );
    const marginLeft = offset - (offset * width) / 100;

    return {
      marginLeft,
      width,
      relativeDuration,
      slices: span.enters.map((enter, i) => {
        const width = scaleToMax(
          [span.exits[i] - enter],
          allExits - allEnters
        )[0];
        const offset = scaleNumbers([enter], span.createdAt, span.closedAt)[0];
        const marginLeft = offset - (offset * width) / 100;
        return {
          width,
          marginLeft,
        };
      }),
    };
  });

  const newSpans = spans.map((s, i) => ({ ...s, ...result[i] }));
  return newSpans;
}
