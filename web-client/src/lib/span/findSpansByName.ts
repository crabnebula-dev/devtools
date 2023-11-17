import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { SpanWithChildren } from "./types";

type Options = { span: SpanWithChildren; metadata: Map<bigint, Metadata> };

export function findSpansByName(
  { span, metadata }: Options,
  name: string
): Span[] | null {
  const meta = metadata.get(span.metadataId);
  if (meta?.name === name) {
    return [span];
  }

  return (
    span.children.filter((c) => metadata.get(c.metadataId)!.name === name) ??
    null
  );
}
