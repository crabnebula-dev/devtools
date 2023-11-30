import { Span } from "../connection/monitor";
import { calculateSpanColorFromRelativeDuration } from "./calculate-span-color-from-relative-duration";

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
  averageSpanDuration: number
) {
  const relativeDuration = (duration / averageSpanDuration) * 100;
  return calculateSpanColorFromRelativeDuration(relativeDuration);
}

export function computeWaterfallStyle(
  span: Span,
  start: number,
  end: number,
  granularity: number
) {
  const offset = scaleNumbers([span.createdAt], start, end)[0];
  const totalDuration = end - start;
  const width = Math.min(
    scaleToMax([span.duration], totalDuration / granularity)[0],
    100 - offset
  );
  const marginLeft = offset - (offset * width) / 100;

  return `width:${width}%;margin-left:${marginLeft}%;`;
}

export function computeSlices(span: Span) {
  const allExits = span.exits.reduce((acc, e) => acc + e, 0);
  const allEnters = span.enters.reduce((acc, e) => acc + e, 0);

  const slices = span.enters.map((enter, i) => {
    const width = scaleToMax([span.exits[i] - enter], allExits - allEnters)[0];
    const offset = scaleNumbers([enter], span.createdAt, span.closedAt)[0];
    const marginLeft = offset - (offset * width) / 100;
    return {
      width,
      marginLeft,
    };
  });

  return slices.map(
    (slice) => `width:${slice.width}%;margin-left:${slice.marginLeft}%;`
  );
}
