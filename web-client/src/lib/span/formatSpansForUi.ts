import { Metadata } from "../proto/common";
import { calculateSpanColorFromRelativeDuration } from "./calculateSpanColorFromRelativeDuration";
import { flattenChildren } from "./flattenChildren";
import { getEventName } from "./getEventName";
import { getIpcRequestName } from "./getIpcRequestName";
import { normalizeSpans } from "./normalizeSpans";
import { FilteredSpan } from "./types";

type Options = {
  spans: FilteredSpan[];
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

function getSpanName(span: FilteredSpan, metadata: Map<bigint, Metadata>) {
  if (span.kind === "ipc") {
    return getIpcRequestName({ metadata, span })
  } else if (span.kind === "event") {
    return getEventName({ metadata, span })
  } else if (span.kind === undefined) {
    return metadata.get(span.metadataId)?.name ?? null
  } else {
    return "not implemented"
  }
}

export function formatSpansForUi({
  spans,
  metadata,
  granularity,
}: Options): UiSpan[] {
  const result = normalizeSpans(spans, granularity).map((span) => {
    const isProcessing = span.closedAt < 0;
    return {
      id: String(span.id),
      isProcessing,
      name: getSpanName(span, metadata) || "-",
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
        spans: flattenChildren(span.children),
        metadata,
      }),
    };
  });

  return result;
}
