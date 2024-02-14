import { UiSpan } from "./format-spans-for-ui";
import { processFieldValue } from "./process-field-value";

export function spanFieldsToObject(span: UiSpan) {
  return (span.fields?.reduce(
    (acc, field) => ({ ...acc, [field.name]: processFieldValue(field.value) }),
    {},
  ) ?? {}) as Record<string, string>;
}
