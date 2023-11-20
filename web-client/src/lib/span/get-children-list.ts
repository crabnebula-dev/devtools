import { Span } from "../connection/monitor";

export function getChildrenList(
  spans: Span[],
  span: Span,
  filter?: (span: Span) => boolean
): Span[] {
  let children: Span[] = [];
  for (const s of spans) {
    if (s.parentId === span.id) {
      if (filter === undefined || filter(s)) {
        children.push(s);
      }
      children = children.concat(getChildrenList(spans, s, filter));
    }
  }

  return children;
}
