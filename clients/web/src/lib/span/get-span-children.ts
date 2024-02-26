import { Span } from "../connection/monitor";

export function getSpanChildren(span: Span) {
  let children: Span[] = [];

  for (const s of span.children) {
    children.push(s);
    children = children.concat(getSpanChildren(s));
  }

  return children;
}
