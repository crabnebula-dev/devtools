import { isEventSpan } from "./is-event-span";
import { Span } from "../connection/monitor";
import { getSpanChildren } from "./get-span-children";
import { getSpanChildrenWithFilter } from "./get-span-children-with-filter";

export function getSpanKind(span: Span) {
  return getSpanKindByMetadata(span);
}

export function getSpanKindByMetadata(span: Span) {
  if (isEventSpan(span)) {
    return "event";
  }

  const spanMetadata = span.metadata;
  if (spanMetadata?.name === "wry::custom_protocol::handle") {
    const children = getSpanChildren(span);
    if (
      children.some((s) => {
        if (s.metadata?.name === "ipc::request::handle") {
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
