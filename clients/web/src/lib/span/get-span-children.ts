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

export type TreeEntry = {
  depth: number;
  span: Span;
};

export function treeEntries(
  span: Span,
  filter: (span: Span) => unknown = () => true,
  maxDepth = 10,
  depth = 0,
): TreeEntry[] {
  const self = { depth, span };
  const showMe = filter(span);
  if (depth === maxDepth) return showMe ? [self] : [];

  // Ensure children are chronologically ordered before recursion.
  const children = [...span.children].sort((a, b) => a.createdAt - b.createdAt);

  // Concat each of the child trees.
  return children.reduce(
    (agg, v) =>
      agg.concat(
        // Note: we don't increase depth if we're filtering the current node.
        // This way we visually "reassign" our parent to one that matches the level filter.
        treeEntries(v, filter, maxDepth, showMe ? depth + 1 : depth),
      ),
    showMe ? [self] : [],
  );
}
