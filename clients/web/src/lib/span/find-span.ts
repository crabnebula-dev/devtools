import type { Span } from "../connection/monitor";

/**
 * Like Array.find but recursively for the tree of children.
 *
 * Performs a depth-first search and returns on the first match.
 * When the predicate returns a *truthy* value it's considered a match.
 *
 * Note: this may match the root span as well.
 */
export function findSpan(
  value: Span,
  predicate: (value: Span, depth: number) => unknown,
  // Add max depth before current depth, as you may want to set a max when calling.
  maxDepth = 10,
  depth = 0,
): Span | undefined {
  // Try to match ourself.
  if (predicate(value, depth)) return value;

  // Break before looping if we shouldn't go deeper.
  if (depth === maxDepth) return;

  // Go depth-first on the children.
  for (const child of value.children) {
    const match = findSpan(child, predicate, maxDepth, depth + 1);
    if (match) return match;
  }
}
