import { Metadata } from "../proto/common";
import { getEventName } from "./get-event-name";
import { getIpcRequestName } from "./get-ipc-request-name";
import { getSpanKind } from "./get-span-kind";
import { useMonitor } from "~/context/monitor-provider";
import type { Span } from "../connection/monitor";
import type { SpanEvent_Span } from "../proto/spans";
import { convertTimestampToNanoseconds } from "../formatters";

export function getSpanName(span: Span) {
  if (span.kind === "ipc") {
    return getIpcRequestName(span);
  } else if (span.kind === "event") {
    return getEventName(span);
  } else if (span.kind === undefined) {
    return span.metadata?.name ?? null;
  } else {
    return "not implemented";
  }
}

export function formatSpanForUi(span: SpanEvent_Span) {
  const { monitorData } = useMonitor();
  return formatSpanForUiWithMetadata(span, monitorData.metadata);
}

export function formatSpanForUiWithMetadata(
  spanEvent: SpanEvent_Span,
  metadata: Map<bigint, Metadata>
) {
  const createdAt = spanEvent.at
    ? convertTimestampToNanoseconds(spanEvent.at)
    : -1;

  const span = {
    id: spanEvent.id,
    name: "",
    parentId: spanEvent.parent,
    kind: undefined,
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
  } satisfies Span;

  span.kind = getSpanKind(span) ?? undefined;
  span.name = getSpanName(span) || "-";
  return span;
}
