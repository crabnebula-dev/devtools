import { Span } from "../connection/monitor";

export function getSpanChildren(span: Span, maxDepth = 10, depth = -1) {
  let children: Span[] = [];

  depth++;

  if (depth === maxDepth) return children;

  for (const s of span.children) {
    children.push(s);
    children = children.concat(getSpanChildren(s, maxDepth, depth));
  }

  return children;
}
