import { Metadata } from "../proto/common";
import { isEventSpan } from "./is-event-span";
import { processFieldValue } from "./process-field-value";
import { FilteredSpan } from "./types";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: FilteredSpan;
};

export function getEventName({ metadata, span }: Options) {
  const name = metadata.get(span.metadataId)?.name ?? null;

  if (isEventSpan({ metadata, span })) {
    const eventField = span.fields.find((f) => f.name === "event");
    if (eventField) {
      const kind = name?.startsWith("app::")
        ? "global event"
        : name === "window::trigger"
        ? "rust event"
        : "event";
      return `${kind}: ${processFieldValue(eventField.value)}`;
    }
  }

  return name;
}
