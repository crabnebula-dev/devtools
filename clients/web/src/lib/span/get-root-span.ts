import type { Span } from "../connection/monitor";
import { ReactiveMap } from "@solid-primitives/map";

export function getRootSpan(
  span: Span,
  spansMap: ReactiveMap<bigint, Span>,
): Span | null {
  if (!span.parentId) return span;
  const parentSpan = spansMap.get(span.parentId);
  return parentSpan ? getRootSpan(parentSpan, spansMap) : null;
}
