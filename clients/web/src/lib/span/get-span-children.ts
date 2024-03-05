import { Span } from "../connection/monitor";

export function getSpanChildren(
  span: Span,
  filter?: string,
  all: Span[] = [],
  depth = 0,
  maxDepth = 10,
) {
  if (depth === maxDepth) return all;

  const spans = span.children;

  const toPush = filter
    ? spans.filter((span) => span.metadata?.name === filter)
    : spans;

  all.push(...toPush);

  for (const child of spans) getSpanChildren(child, filter, all, depth + 1);

  return all;
}
