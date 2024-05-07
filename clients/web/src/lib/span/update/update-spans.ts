import { type Span, type Durations } from "~/lib/connection/monitor";
import { type SpanEvent } from "~/lib/proto/spans";
import { formatSpan } from "../format-span";
import { Metadata } from "../../proto/common";
import { type ReactiveMap } from "@solid-primitives/map";
import { mutateDirtyRoot } from "./mutate-dirty-root";
import { mutateSpanOnNew } from "./mutate-span-on-new";
import { mutateSpanOnEnter } from "./mutate-span-on-enter";
import { mutateSpanOnExit } from "./mutate-span-on-exit";
import { mutateSpanOnClose } from "./mutate-span-on-close";
import { mutateSpanOnRecorded } from "./mutate-span-on-recorded";
import { mutateDurationsOnNew } from "./mutate-durations-on-new";
import { mutateDurationsOnClose } from "./mutate-durations-on-close";
import { mutateWhenKnownKind } from "./kinds/mutate-when-known-kind";

export function updatedSpans(
  errorMetadata: Set<bigint>,
  errorEventParents: Set<bigint>,
  currentSpans: ReactiveMap<bigint, Span>,
  spanEvents: SpanEvent[],
  metadata: Map<bigint, Metadata>,
  oldDurations: Durations,
) {
  const dirtyRoots: Set<Span> = new Set();
  const erroredRoots: Set<Span> = new Set();

  const durations = { ...oldDurations };

  for (const event of spanEvents) {
    switch (event.event.oneofKind) {
      case "newSpan": {
        const newEvent = event.event.newSpan;
        const span = formatSpan(newEvent, metadata);

        mutateSpanOnNew(
          span,
          newEvent,
          currentSpans,
          errorMetadata,
          errorEventParents,
          dirtyRoots,
          erroredRoots,
        );
        mutateDurationsOnNew(span, durations);
        mutateWhenKnownKind(span);
        currentSpans.set(span.id, span);

        break;
      }
      case "enterSpan": {
        const enterEvent = event.event.enterSpan;
        const span = currentSpans.get(enterEvent.spanId);

        if (!span) break;

        mutateSpanOnEnter(span, enterEvent);
        currentSpans.set(span.id, span);

        break;
      }
      case "exitSpan": {
        const exitEvent = event.event.exitSpan;
        const span = currentSpans.get(exitEvent.spanId);

        if (!span) break;

        mutateSpanOnExit(span, exitEvent);
        currentSpans.set(span.id, span);

        break;
      }

      case "closeSpan": {
        const closeEvent = event.event.closeSpan;
        const span = currentSpans.get(closeEvent.spanId);

        if (!span) break;

        mutateSpanOnClose(span, closeEvent);
        mutateDurationsOnClose(span, durations);
        currentSpans.set(span.id, span);

        break;
      }

      case "recorded": {
        const recordedEvent = event.event.recorded;
        const span = currentSpans.get(recordedEvent.spanId);

        if (!span) break;

        mutateSpanOnRecorded(span, recordedEvent);
        currentSpans.set(span.id, span);

        break;
      }

      /**
       * @todo
       * we need to handle this more.
       * if Rust client breaks, we may get `undefined`
       */
      default:
        throw new Error("span type not supported");
    }
  }

  // Root spans with child updates
  for (const span of dirtyRoots) {
    mutateDirtyRoot(span, currentSpans, erroredRoots);
  }

  return durations;
}
