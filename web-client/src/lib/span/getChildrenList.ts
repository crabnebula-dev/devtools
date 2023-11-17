import { Span } from "../connection/monitor";

export function getChildrenList(spans: Span[], span: Span): Span[] {
  let children: Span[] = [];
  for (const s of spans) {
    if (s.parentId === span.id) {
      children.push(s);
      children = children.concat(getChildrenList(spans, s));
    }
  }

  return children;
}
