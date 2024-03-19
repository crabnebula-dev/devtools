import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { getEventName } from "./get-event-name";
import { getIpcRequestName } from "./get-ipc-request-name";
import { SpanKind } from "./types";
import { getSpanKindByMetadata } from "./get-span-kind";
import { useMonitor } from "~/context/monitor-provider";
import { Field } from "../proto/common";

export type UiSpan = {
  id: bigint;
  isProcessing: boolean;
  name: string;
  kind?: SpanKind;
  parentId?: bigint;
  initiated: number;
  time: number;
  children: bigint[];
  metadataId: bigint;
  metadataName?: string;
  metadataTarget?: string;
  fields: Field[];
  original: Span;
  duration: number;
  hasError: boolean | null;
};

export type BaseSpan = { children: BaseSpan[] } & Span;

export function getSpanName(span: UiSpan) {
  const { monitorData } = useMonitor();
  return getSpanNameByMetadata(span, monitorData.metadata);
}

function getSpanNameByMetadata(span: UiSpan, metadata: Map<bigint, Metadata>) {
  if (span.kind === "ipc") {
    return getIpcRequestName({ metadata, span });
  } else if (span.kind === "event") {
    return getEventName({ metadata, span });
  } else if (span.kind === undefined) {
    return metadata.get(span.metadataId)?.name ?? null;
  } else {
    return "not implemented";
  }
}

export function formatSpanForUi(span: Span) {
  const { monitorData } = useMonitor();
  return formatSpanForUiWithMetadata(
    span,
    monitorData.metadata,
    monitorData.spans,
  );
}

export function formatSpanForUiWithMetadata(
  span: Span,
  metadata: Map<bigint, Metadata>,
  spans: Span[],
) {
  const isProcessing = span.closedAt < 0;

  const kind: SpanKind | undefined =
    getSpanKindByMetadata({ metadata, span, spans }) ?? undefined;

  const emptySpan = {
    ...span,
    kind,
    children: [],
    isProcessing: true,
    name: "",
    initiated: 0,
    time: 0,
    original: span,
  };

  const newUiSpan = {
    id: span.id,
    metadataId: span.metadataId,
    metadataName: metadata.get(span.metadataId)?.name,
    metadataTarget: metadata.get(span.metadataId)?.target,
    fields: span.fields,
    isProcessing: isProcessing,
    duration:
      span.duration === -1 ? Date.now() - span.createdAt : span.duration,
    name: getSpanNameByMetadata(emptySpan, metadata) || "-",
    parentId: span.parentId,
    kind: kind,
    initiated: span.createdAt / 1000000,
    time: !isProcessing
      ? (span.closedAt - span.createdAt) / 1e6
      : Date.now() - span.createdAt / 1e6,
    children: [],
    original: span,
    hasError: span.hasError,
  } satisfies UiSpan;

  return newUiSpan;
}
