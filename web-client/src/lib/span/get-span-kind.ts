import { Metadata } from "../proto/common";
import { isEventSpan } from "./is-event-span";
import { useMonitor } from "~/context/monitor-provider";
import { Span } from "../connection/monitor";
import { getSpanChildren } from "./get-span-children";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: Span;
  spans: Span[];
};

export function getSpanKind(span: Span) {
  const { monitorData } = useMonitor();
  return getSpanKindByMetadata({
    metadata: monitorData.metadata,
    span,
    spans: monitorData.spans,
  });
}

export function getSpanKindByMetadata({ metadata, span, spans }: Options) {
  if (isEventSpan({ metadata, span })) {
    return "event";
  }

  const spanMetadata = metadata.get(span.metadataId);

  if (spanMetadata?.name === "wry::custom_protocol::handle") {
    const children = getSpanChildren(span, spans);
    if (
      children.some((s) => {
        if (metadata.get(s.metadataId)?.name === "ipc::request::handle") {
          const cmdField = s.fields.find((f) => f.name === "cmd");
          return (
            cmdField &&
            cmdField.value.oneofKind === "strVal" &&
            cmdField.value.strVal !== "plugin:__TAURI_CHANNEL__|fetch"
          );
        }
        return false;
      })
    ) {
      return "ipc";
    }
  }

  return spanMetadata?.name === "wry::ipc::handle" ? "ipc" : null;
}
