import { Span } from "~/lib/connection/monitor";

export function findSpanById(spans: Span[], id: bigint): Span | null {
  for (const s of spans) {
    if (s.id === id) {
      return s;
    }

    const p = findSpanById(s.children, id);
    if (p) {
      return p;
    }
  }
  return null;
}
