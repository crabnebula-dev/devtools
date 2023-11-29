import { Span } from "../connection/monitor";
import { FilteredSpan } from "./types";

export function getChildrenList(
  spans: Span[],
  span: FilteredSpan,
  filter?: (span: FilteredSpan) => boolean
): FilteredSpan[] {
  let children: FilteredSpan[] = [];
  for (const s of spans) {
    if (s.parentId === span.id) {
      const child = { ...s, kind: span.kind };

      if (filter === undefined || filter(child)) {
        children.push(child);
      }
      children = children.concat(getChildrenList(spans, child, filter));
    }
  }

  return children;
}
