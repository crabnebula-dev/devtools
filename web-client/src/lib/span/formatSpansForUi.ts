import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { flattenChildren } from "./flattenChildren";
import { getIpcRequestName } from "./getIpcRequestName";
import { normalizeSpans } from "./normalizeSpans";

type Options = {
  spans: Span[];
  metadata: Map<bigint, Metadata>;
};

export function formatSpansForUi({ spans, metadata }: Options): any {
  const result = normalizeSpans(spans).map((span) => {
    return {
      id: String(span.id),
      name: getIpcRequestName({ metadata, span }) || "-",
      initiated: span.createdAt / 1000000,
      time:
        span.closedAt > 0
          ? (span.closedAt - span.createdAt) / 1e6
          : Date.now() - span.createdAt / 1e6,
      waterfall: `width:${span.width}%;margin-left:${span.marginLeft}%;`,
      start: span.marginLeft,
      slices: span.slices.map(
        (slice) => `width:${slice.width}%;margin-left:${slice.marginLeft}%;`
      ),
      children: formatSpansForUi({
        spans: flattenChildren(span.children),
        metadata,
      }),
    };
  });

  return result;
}
