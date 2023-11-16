import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { flattenChildren } from "./flattenChildren";

type Options = { span: Span; metadata: Map<bigint, Metadata> };

export function recursivelyFindSpanByName(
  { span, metadata }: Options,
  name: string
): Span[] | null {
  const meta = metadata.get(span.metadataId)!;
  if (meta.name === name) {
    return [span];
  }

  const allChildren = flattenChildren(span.children);
  return (
    allChildren?.filter((c) => metadata.get(c.metadataId)!.name === name) ??
    null
  );
}
