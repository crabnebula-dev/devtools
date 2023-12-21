import { Metadata } from "../proto/common";
import { isEventSpan } from "./is-event-span";
import { useMonitor } from "~/context/monitor-provider";
import { Span } from "../connection/monitor";
import { getSpanChildren } from "./get-span-children";

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

  if (spanMetadata?.name === "wry::custom_protocol::handle") {
    const { monitorData } = useMonitor();
    const children = getSpanChildren(span, monitorData.spans);
    if (
      children.some(
        (s) => monitorData.metadata.get(s.metadataId)?.name === "ipc::request"
      )
    ) {
      return "ipc";
    }
  }

  return spanMetadata?.name === "wry::ipc::handle" ? "ipc" : null;
}
