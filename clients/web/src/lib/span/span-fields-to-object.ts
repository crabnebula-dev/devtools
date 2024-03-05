import { Span } from "../connection/monitor";
import { processFieldValue } from "./process-field-value";

export function spanFieldsToObject(span: Span) {
  return (span.fields?.reduce(
    (acc, field) => ({ ...acc, [field.name]: processFieldValue(field.value) }),
    {},
  ) ?? {}) as Record<string, string>;
}
