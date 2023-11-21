import { Field, Metadata } from "../proto/common";
import { findSpansByName } from "./find-spans-by-name";
import { IpcSpanName } from "./ipc-spans";
import { SpanWithChildren } from "./types";

type Options = {
  metadata: Map<bigint, Metadata>;
  rootSpan: SpanWithChildren;
};

export function getIpcRequestValues({ metadata, rootSpan }: Options) {
  return function (name: IpcSpanName) {
    const spans = findSpansByName({ span: rootSpan, metadata }, name);

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
