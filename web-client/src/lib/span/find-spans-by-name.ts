import { Metadata } from "../proto/common";
import { UiSpan } from "./format-spans-for-ui";

type Options = { span: UiSpan; metadata: Map<bigint, Metadata> };

export function findSpansByName(
  { span, metadata }: Options,
  name: string
): UiSpan[] | null {
  const meta = metadata.get(span.metadataId);
  if (meta?.name === name) {
    return [span];
  }
  return (
    span.children.filter((c) => metadata.get(c.metadataId)?.name === name) ??
    null
  );
}
