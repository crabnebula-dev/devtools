import { Metadata } from "../proto/common";
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

  const spanMetadata = metadata.get(spanEvent.metadataId);

  const span: Span = {
    id: spanEvent.id,
    name: spanMetadata?.name ?? "-", // NOTE: this is a fallback
    parentId: spanEvent.parent,
    metadataId: spanEvent.metadataId,
    metadata: spanMetadata,
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

  return span;
}
