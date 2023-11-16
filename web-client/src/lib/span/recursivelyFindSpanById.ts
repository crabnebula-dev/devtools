import { Span } from "../connection/monitor";

// we want to keep the children structure to we do not flatten the list
export function recursivelyFindSpanById(spans: Span[], id: bigint): Span | null {
  for (const span of spans) {
    if (span.id === id) {
      return span;
    }

    const found = recursivelyFindSpanById(span.children, id);
    if (found) {
      return found;
    }
  }

  return null;
}
