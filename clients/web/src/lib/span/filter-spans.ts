import { ReactiveMap } from "@solid-primitives/map";
import { Span } from "../connection/monitor";

export function filterSpans(
  alreadyFiltered: Span[],
  spanProcessingPointer: number,
  allSpans: ReactiveMap<bigint, Span>
): [filteredSpans: Span[], newPointer: number] {
  let localPointer = 0;

  if (spanProcessingPointer + 1 === allSpans.size)
    return [alreadyFiltered, spanProcessingPointer];
  if (spanProcessingPointer + 1 > allSpans.size) {
    spanProcessingPointer = 0;
    alreadyFiltered = [];
  }
  allSpans.forEach((span) => {
    if (localPointer > spanProcessingPointer && span.kind) {
      alreadyFiltered.push(span);
    }

    localPointer++;
  });

  spanProcessingPointer = localPointer;
  return [[...alreadyFiltered], spanProcessingPointer];
}
