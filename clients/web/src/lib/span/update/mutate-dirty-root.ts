import { filterSpan, mutateWhenKnownKind } from "../detect-known-trace";
import type { Span } from "~/lib/connection/monitor";
import type { ReactiveMap } from "@solid-primitives/map";

export function mutateDirtyRoot(
  span: Span,
  allSpans: ReactiveMap<bigint, Span>,
  erroredRoots: Set<Span>,
) {
  // Do this regardless of kind.
  span.hasChildError = span.hasChildError || erroredRoots.has(span);

  // Interpret the root span.
  mutateWhenKnownKind(span);

  // HACK: we still display child spans of particular "kinds".
  // Run them through our detection too.
  const spansWithKind = filterSpan(span, (s) => s.kind);
  for (const child of spansWithKind) {
    // Interpret the child span.
    mutateWhenKnownKind(child);

    // Trigger reactivity on the span.
    // NOTE: This needs to happen before the root node, or we cause duplicate entries in detail view.
    allSpans.set(child.id, child);
  }

  // Trigger reactivity on the dirty root.
  allSpans.set(span.id, span);
}
