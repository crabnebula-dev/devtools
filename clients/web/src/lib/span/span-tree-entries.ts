import type { Span } from "../connection/monitor";

export type SpanTreeEntry = {
  depth: number;
  span: Span;
};

// ToDo: Make sure to revisit the use of sort, reduce and concat this could potentially be really slow
export function spanTreeEntries(
  span: Span,
  filter: (span: Span) => unknown = () => true,
  maxDepth = 10,
  depth = 0,
): SpanTreeEntry[] {
  const self = { depth, span };
  const showMe = filter(span);
  if (depth === maxDepth) return showMe ? [self] : [];

  // Ensure children are chronologically ordered before recursion.
  const children = span.children.toSorted((a, b) => a.createdAt - b.createdAt);

  // Concat each of the child trees.
  return children.reduce(
    (agg, v) =>
      agg.concat(
        // Note: we don't increase depth if we're filtering the current node.
        // This way we visually "reassign" our parent to one that matches the level filter.
        spanTreeEntries(v, filter, maxDepth, showMe ? depth + 1 : depth),
      ),
    showMe ? [self] : [],
  );
}
