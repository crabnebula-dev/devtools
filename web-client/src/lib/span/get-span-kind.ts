import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { isEventSpan } from "./is-event-span";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: Span;
};

export function getSpanKind({ metadata, span }: Options) {
  if (isEventSpan({ metadata, span })) {
    return "event";
  }

  const spanMetadata = metadata.get(span.metadataId);
  return spanMetadata?.name === "wry::ipc::handle" ? "ipc" : null;
}
