import type { Span } from "~/lib/connection/monitor";
import { NamedSpanMap } from "./named-spans";

export function mutateWhenNamedIpcSpan(span: Span) {
  const mappedName = NamedSpanMap.get(span.name);
  if (!mappedName) return false;

  span.displayName = mappedName;
  return true;
}
