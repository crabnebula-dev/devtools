import { type Span, type Durations } from "~/lib/connection/monitor";
import {
  SpanEvent_Enter,
  type SpanEvent,
  SpanEvent_Span,
  SpanEvent_Recorded,
} from "~/lib/proto/spans";
import { convertTimestampToNanoseconds } from "../formatters";
import { formatSpan } from "./format-span";
import { Metadata } from "../proto/common";
import { type ReactiveMap } from "@solid-primitives/map";
import { filterSpan, mutateWhenKnownKind } from "./detect-known-trace";
import { SpanEvent_Close, SpanEvent_Exit } from "~/lib/proto/spans";

export function findRoot(
  span: Span,
  spansMap: ReactiveMap<bigint, Span>,
): Span | null {
  if (!span.parentId) return span;
  const parentSpan = spansMap.get(span.parentId);
  return parentSpan ? findRoot(parentSpan, spansMap) : null;
}

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

function mutateDirtyRoot(
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

function mutateSpanOnNew(
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
      parent.children.push(span);
      span.parent = parent;
    }

    const root = findRoot(span, currentSpans);
    if (root != null) {
      dirtyRoots.add(root);
      if (span.hasError) erroredRoots.add(root);
    }
  }
}

function mutateSpanOnEnter(span: Span, enterEvent: SpanEvent_Enter) {
  const enteredAt = enterEvent.at
    ? convertTimestampToNanoseconds(enterEvent.at)
    : -1;

  span.enters.push({
    timestamp: enteredAt,
    threadID: Number(enterEvent.threadId),
  });
}

function mutateSpanOnExit(span: Span, exitEvent: SpanEvent_Exit) {
  const exitedAt = exitEvent.at
    ? convertTimestampToNanoseconds(exitEvent.at)
    : -1;
  span.exits.push({
    timestamp: exitedAt,
    threadID: Number(exitEvent.threadId),
  });
}

function mutateSpanOnClose(span: Span, closeEvent: SpanEvent_Close) {
  span.closedAt = closeEvent.at
    ? convertTimestampToNanoseconds(closeEvent.at)
    : -1;
  span.duration = span.closedAt - span.createdAt;

  span.isProcessing = span.closedAt < 0;

  span.time = !span.isProcessing
    ? span.duration / 1e6
    : Date.now() - span.createdAt / 1e6;
}

function mutateSpanOnRecorded(span: Span, recordedEvent: SpanEvent_Recorded) {
  span.fields = [...span.fields, ...recordedEvent.fields];
}

function mutateDurationsOnNew(span: Span, durations: Durations) {
  if (!durations.start || span.createdAt < durations.start)
    durations.start = span.createdAt;

  durations.openSpans++;
}

function mutateDurationsOnClose(span: Span, durations: Durations) {
  if (span.closedAt > durations.end) durations.end = span.closedAt;
  if (!durations.shortestTime || span.duration < durations.shortestTime)
    durations.shortestTime = span.duration;
  if (!durations.longestTime || span.duration > durations.longestTime)
    durations.longestTime = span.duration;

  if (span.kind || !span.parent) {
    durations.average =
      (durations.average * durations.counted + span.duration) /
      (durations.counted + 1);
    durations.counted++;
  }

  durations.openSpans--;
}
