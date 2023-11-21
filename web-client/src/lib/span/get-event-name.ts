import { Metadata } from "../proto/common";
import { processFieldValue } from "./process-field-value";
import { FilteredSpan } from "./types";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: FilteredSpan;
};

const emitSpanNames = ["app::emit::all", "app::emit::filter", "app::emit::to", "app::emit::rust", "window::emit::to", "window::emit::all"];

export function getEventName({ metadata, span }: Options) {
  const name = metadata.get(span.metadataId)?.name ?? null;

  if (emitSpanNames.includes(name ?? "")) {
    const eventField = span.fields.find((f) => f.name === "event");
    if (eventField) {
      return processFieldValue(eventField.value);
    }
  }

  return name;
}
