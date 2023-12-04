import { Metadata } from "../proto/common";
import { isEventSpan } from "./is-event-span";
import { useMonitor } from "~/context/monitor-provider";
import { Span } from "../connection/monitor";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: Span;
};

export function getSpanKind(span: Span) {
  const { monitorData } = useMonitor();
  return getSpanKindByMetadata({ metadata: monitorData.metadata, span });
}

export function getSpanKindByMetadata({ metadata, span }: Options) {
  if (isEventSpan({ metadata, span })) {
    return "event";
  }

  const spanMetadata = metadata.get(span.metadataId);
  return spanMetadata?.name === "wry::ipc::handle" ? "ipc" : null;
}
