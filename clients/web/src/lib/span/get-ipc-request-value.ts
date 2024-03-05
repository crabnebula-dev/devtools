import { Field } from "../proto/common";
import { Span } from "../connection/monitor";
import { IpcSpanName } from "./ipc-spans";
import { getSpanChildren } from "./get-span-children";

export function getIpcRequestValues(rootSpan: Span) {
  return function (name: IpcSpanName) {
    const spans = getSpanChildren(rootSpan, name);

    if (!spans) {
      return null;
    }

    const result = {
      spans,
      fields: spans.map(
        (span) =>
          (span?.fields?.reduce(
            (acc, field) => ({ ...acc, [field.name]: field.value }),
            {},
          ) ?? {}) as Record<string, Field["value"]>,
      ),
      metadata: spans.map((span) => span.metadata),
    };

    return result;
  };
}
