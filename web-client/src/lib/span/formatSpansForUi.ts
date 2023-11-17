import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { calculateSpanColorFromRelativeDuration } from "./calculateSpanColorFromRelativeDuration";
import { getIpcRequestName } from "./getIpcRequestName";
import { normalizeSpans } from "./normalizeSpans";

type Options = {
  allSpans: Span[];
  spans: Span[];
  metadata: Map<bigint, Metadata>;
  granularity?: number;
};

type UiSpan = {
  id: string;
  isProcessing: boolean;
  name: string;
  initiated: number;
  time: number;
  waterfall: string;
  start: number;
  slices: string[];
  colorClassName: string;
  children: UiSpan[];
};

export function formatSpansForUi({
  allSpans,
  spans,
  metadata,
  granularity,
}: Options): UiSpan[] {
  const result = normalizeSpans(allSpans, spans, granularity).map((span) => {
    const isProcessing = span.closedAt < 0;
    return {
      id: String(span.id),
      isProcessing,
      name: getIpcRequestName({ metadata, span }) || "-",
      initiated: span.createdAt / 1000000,
      time: !isProcessing
        ? (span.closedAt - span.createdAt) / 1e6
        : Date.now() - span.createdAt / 1e6,
      waterfall: `width:${span.width}%;margin-left:${span.marginLeft}%;`,
      start: span.marginLeft,
      slices: span.slices.map(
        (slice) => `width:${slice.width}%;margin-left:${slice.marginLeft}%;`
      ),
      colorClassName: calculateSpanColorFromRelativeDuration(
        span.relativeDuration
      ),
      children: formatSpansForUi({
        allSpans,
        spans: span.children,
        metadata,
      }),
    };
  });

  return result;
}
