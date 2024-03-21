import { Metadata } from "../proto/common";
import { getSpanName } from "./get-span-name";
import { getSpanKind } from "./get-span-kind";
import type { Span } from "../connection/monitor";
import type { SpanEvent_Span } from "../proto/spans";
import { convertTimestampToNanoseconds } from "../formatters";

export function formatSpan(
  spanEvent: SpanEvent_Span,
  metadata: Map<bigint, Metadata>,
) {
  const createdAt = spanEvent.at
    ? convertTimestampToNanoseconds(spanEvent.at)
    : -1;

  const span: Span = {
    id: spanEvent.id,
    name: "",
    parentId: spanEvent.parent,
    metadataId: spanEvent.metadataId,
    metadata: metadata.get(spanEvent.metadataId),
    fields: spanEvent.fields,
    createdAt: createdAt,
    enters: [],
    exits: [],
    initiated: createdAt / 1000000,
    time: -1,
    duration: -1,
    isProcessing: true,
    children: [],
    closedAt: -1,
    aborted: false,
    hasError: null,
  };

  // NOTE: we're still doing this here, so detection is still partially migrated to `detect-known-traces.ts`.
  span.kind = getSpanKind(span);
  span.name = getSpanName(span) || "-";
  return span;
}
