import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { calculateSpanColorFromRelativeDuration } from "./calculate-span-color-from-relative-duration";
import { getEventName } from "./get-event-name";
import { getIpcRequestName } from "./get-ipc-request-name";
import { normalizeSpans } from "./normalize-spans";
import { spanFieldsToObject } from "./span-fields-to-object";
import { FilteredSpanWithChildren } from "./types";

type Options = {
  allSpans: Span[];
  spans: Span[];
  metadata: Map<bigint, Metadata>;
  granularity?: number;
};

export type UiSpan = {
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

function getSpanName(
  span: FilteredSpanWithChildren,
  metadata: Map<bigint, Metadata>
) {
  if (span.kind === "ipc") {
    return getIpcRequestName({ metadata, span });
  } else if (span.kind === "event") {
    return getEventName({ metadata, span });
  } else if (span.kind === "updater-check") {
    return "Checking for update";
  } else if (span.kind === "updater-download-and-install") {
    return "Downloading update";
  } else if (span.kind === undefined) {
    const name = metadata.get(span.metadataId)?.name ?? null;

    if (name === "updater::check::fetch") {
      const urlField = span.fields.find((f) => f.name === "url")?.value;
      if (urlField?.oneofKind === "strVal") {
        return `fetch ${urlField.strVal}`;
      }
    }

    return name;
  } else {
    return "not implemented";
  }
}

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
        allSpans,
        spans: span.children,
        metadata,
      }),
    };
  });

  return result;
}
