import { Field, Metadata } from "../proto/common";
import { UiSpan } from "./format-spans-for-ui";
import { IpcSpanName } from "./ipc-spans";
import { getUiSpanChildren } from "./get-ui-span-children";

type Options = {
  metadata: Map<bigint, Metadata>;
  rootSpan: UiSpan;
};

export function getIpcRequestValues({ metadata, rootSpan }: Options) {
  return function (name: IpcSpanName) {
    const spans = getUiSpanChildren(rootSpan, name);

    if (!spans) {
      return null;
    }

    const result = {
      spans,
      fields: spans.map(
        (span) =>
          (span?.fields?.reduce(
            (acc, field) => ({ ...acc, [field.name]: field.value }),
            {}
          ) ?? {}) as Record<string, Field["value"]>
      ),
      metadata: spans.map((span) =>
        metadata.get(span?.metadataId ?? BigInt(0))
      ),
    };

    return result;
  };
}
