import type { Span } from "~/lib/connection/monitor";
import type { SpanEvent_Span } from "~/lib/proto/spans";
import type { ReactiveMap } from "@solid-primitives/map";
import { getRootSpan } from "../get-root-span";

export function mutateSpanOnNew(
  span: Span,
  newEvent: SpanEvent_Span,
  currentSpans: ReactiveMap<bigint, Span>,
  errorMetadata: Set<bigint>,
  errorEventParents: Set<bigint>,
  dirtyRoots: Set<Span>,
  erroredRoots: Set<Span>,
) {
  span.hasError =
    errorMetadata.has(newEvent.metadataId) ||
    errorEventParents.has(newEvent.id) ||
    null;

  if (span.parentId) {
    const parent = currentSpans.get(span.parentId);
    if (parent) {
      parent.children = [...parent.children, span];
      span.parent = parent;
    }
  }

  const root = getRootSpan(span, currentSpans);

  if (root != null && root !== span) {
    span.rootSpan = root;
    dirtyRoots.add(root);
    if (span.hasError) erroredRoots.add(root);
  }

  if (!span.parent) {
    dirtyRoots.add(span);
    if (span.hasError) erroredRoots.add(span);
  }
}
