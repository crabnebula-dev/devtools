import { getSpanName } from "./format-spans-for-ui";
import { getSpanKind } from "./get-span-kind";
import { ReactiveMap } from "@solid-primitives/map";
import { Span } from "../connection/monitor";

export function triggerRenameOnRoot(
  span: Span,
  spansMap: ReactiveMap<bigint, Span>,
) {
  span.kind = span.kind ? span.kind : getSpanKind(span) ?? span.kind;
  span.name = getSpanName(span) ?? span.name;
  //uiSpansMap.set(span.id, span);

  if (span.parentId) {
    const parentSpan = spansMap.get(span.parentId);
    if (parentSpan) triggerRenameOnRoot(parentSpan, spansMap);
  }

  return;
}
