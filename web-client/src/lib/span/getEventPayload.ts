import { Span } from "../connection/monitor";
import { Field, Metadata } from "../proto/common";
import { recursivelyFindSpanByName as recursivelyFindSpansByName } from "./recursivelyFindSpanByName";

type SpanName =
  /* window is emitting the event */
  | "window::emit";

type Options = {
  metadata: Map<bigint, Metadata>;
  rootSpan: Span;
};

export function getEventPayload({ metadata, rootSpan }: Options) {
  return function (name: SpanName) {
    const spans = recursivelyFindSpansByName(
      { span: rootSpan, metadata },
      name
    );

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
