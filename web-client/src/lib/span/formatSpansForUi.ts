import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { calculateSpanColorFromRelativeDuration } from "./calculateSpanColorFromRelativeDuration";
import { flattenChildren } from "./flattenChildren";
import { getIpcRequestName } from "./getIpcRequestName";
import { normalizeSpans } from "./normalizeSpans";

type Options = {
  spans: Span[];
  metadata: Map<bigint, Metadata>;
  granularity?: number;
};

export function formatSpansForUi({ spans, metadata, granularity }: Options): any {
  const result = normalizeSpans(spans, granularity).map((span) => {
    const isProcessing = span.closedAt < 0;
    return {
      id: String(span.id),
      isProcessing,
      name: getIpcRequestName({ metadata, span }) || "-",
      initiated: span.createdAt / 1000000,
      time:
        !isProcessing
          ? (span.closedAt - span.createdAt) / 1e6
          : Date.now() - span.createdAt / 1e6,
      waterfall: `width:${span.width}%;margin-left:${span.marginLeft}%;`,
      start: span.marginLeft,
      slices: span.slices.map(
        (slice) => `width:${slice.width}%;margin-left:${slice.marginLeft}%;`
      ),
      colorClassName: calculateSpanColorFromRelativeDuration(span.relativeDuration),
      children: formatSpansForUi({
        spans: flattenChildren(span.children),
        metadata,
      }),
    };
  });

  return result;
}
