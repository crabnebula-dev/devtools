import { Metadata } from "../proto/common";
import { findSpansByName } from "./find-spans-by-name";
import { spanFieldsToObject } from "./span-fields-to-object";
import { SpanWithChildren } from "./types";

type SpanName =
  /* window is emitting the event */
  "window::emit";

type Options = {
  metadata: Map<bigint, Metadata>;
  rootSpan: SpanWithChildren;
};

export function getEventPayload({ metadata, rootSpan }: Options) {
  return function (name: SpanName) {
    const spans = findSpansByName({ span: rootSpan, metadata }, name);

    if (!spans) {
      return null;
    }

    const result = {
      spans,
      fields: spans.map(spanFieldsToObject),
      metadata: spans.map((span) =>
        metadata.get(span?.metadataId ?? BigInt(0))
      ),
    };

    return result;
  };
}
