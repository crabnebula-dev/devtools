import { Metadata } from "../proto/common";
import { processFieldValue } from "./processFieldValue";
import { FilteredSpan } from "./types";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: FilteredSpan;
};

export function getEventName({ metadata, span }: Options) {
  const eventField = span.fields.find((f) => f.name === "event");
  if (eventField) {
    return processFieldValue(eventField.value);
  }
  return metadata.get(span.metadataId)?.name ?? null;
}
