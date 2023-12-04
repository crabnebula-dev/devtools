import { ReactiveMap } from "@solid-primitives/map";
import { UiSpan } from "./format-spans-for-ui";
import { useCalls } from "~/components/span/calls-context";

export function getUiSpanChildren(
  span: UiSpan,
  filter?: string,
  all: UiSpan[] = [],
  depth = 0,
  maxDepth = 10
) {
  if (depth === maxDepth) return all;

  let allSpans: ReactiveMap<bigint, UiSpan>;

  // In case we can't access the context we return an empty array
  try {
    allSpans = useCalls().spans;
  } catch (e) {
    return [];
  }

  const spans = span.children.map((spanId) => {
    return allSpans.get(spanId) as UiSpan;
  });

  const toPush = filter
    ? spans.filter((span) => span.metadataName === filter)
    : spans;

  all.push(...toPush);

  for (const child of spans) getUiSpanChildren(child, filter, all, depth + 1);

  return all;
}
