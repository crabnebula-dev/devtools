import { useMonitor } from "~/context/monitor-provider";
import { Span } from "../connection/monitor";
import { calculateSpanColorFromRelativeDuration } from "./calculate-span-color-from-relative-duration";
import { useCalls } from "~/components/span/calls-context";

function scaleNumbers(numbers: number[], min: number, max: number): number[] {
  const range = max - min;
  return numbers
    .map((num) => ((num - min) / range) * 100)
    .map((num) => Math.max(0, Math.min(num, 100)));
}

function scaleToMax(numbers: number[], max: number): number[] {
  return numbers.map((num) => (num / max) * 100);
}

export function computeColorClassName(
  duration: number,
  averageSpanDuration: number,
) {
  const relativeDuration = (duration / averageSpanDuration) * 100;
  return calculateSpanColorFromRelativeDuration(relativeDuration);
}

export function computeWaterfallStyle(
  span: Span,
  start: number,
  end: number,
  shortest?: number,
  longest?: number,
) {
  const callsContext = useCalls();
  const {
    monitorData: { durations },
  } = useMonitor();

  const offset = scaleNumbers([span.createdAt], start, end)[0];
  const totalDuration = end - start;

  const shortestSpanTime = shortest ?? durations.shortestTime;

  const longestSpanTime = longest ?? durations.longestTime;

  const granularity =
    ((longestSpanTime ?? 1) / (shortestSpanTime ?? 1)) *
    (callsContext.granularity.granularity() / 10000);

  const scaledDuration =
    callsContext.granularity.granularity() === 1
      ? totalDuration
      : totalDuration / granularity;

  const spanDuration =
    span.duration === -1 ? Date.now() * 1e6 - span.createdAt : span.duration;

  const width = Math.max(
    0.05,
    Math.min(scaleToMax([spanDuration], scaledDuration)[0], 100 - offset),
  );

  const marginLeft = offset;

  return `width:${width}%;margin-left:${marginLeft}%;`;
}

export function computeSlices(span: Span) {
  const allExits = span.exits.reduce((acc, e) => acc + e.timestamp, 0);
  const allEnters = span.enters.reduce((acc, e) => acc + e.timestamp, 0);

  return span.enters.map((entered, i) => {
    const exited = span.exits[i]?.timestamp;

    const width = scaleToMax(
      [exited - entered.timestamp],
      allExits - allEnters,
    )[0];

    const offset = scaleNumbers(
      [entered.timestamp],
      span.createdAt,
      span.closedAt === -1 ? Date.now() * 1e6 : span.closedAt,
    )[0];
    const marginLeft = offset - (offset * width) / 100;

    return {
      entered: entered.timestamp,
      exited,
      threadID: entered.threadID,
      width,
      marginLeft,
    };
  });
}
