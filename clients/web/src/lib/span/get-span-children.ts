import { Span } from "../connection/monitor";

export function getSpanChildren(span: Span, allSpans: Span[]) {
  let children: Span[] = [];

  for (const s of allSpans) {
    if (s.parentId === span.id) {
      children.push(s);
      children = children.concat(getSpanChildren(s, allSpans));
    }
  }

  return children;
}
