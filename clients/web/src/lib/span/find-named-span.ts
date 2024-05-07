import type { Span } from "../connection/monitor";
import { findSpan } from "./find-span";

export function findNamedSpan(
  value: Span,
  partialTarget: string,
  name: string,
  maxDepth = 10,
): Span | undefined {
  return findSpan(
    value,
    (s) =>
      s.metadata?.target.startsWith(partialTarget) && s.metadata?.name === name,
    maxDepth,
  );
}
