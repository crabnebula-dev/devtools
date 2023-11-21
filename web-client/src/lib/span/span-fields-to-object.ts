import { Span } from "../connection/monitor";
import { Field } from "../proto/common";

export function spanFieldsToObject(span: Span) {
  return (span.fields?.reduce(
    (acc, field) => ({ ...acc, [field.name]: field.value }),
    {}
  ) ?? {}) as Record<string, Field["value"]>;
}
