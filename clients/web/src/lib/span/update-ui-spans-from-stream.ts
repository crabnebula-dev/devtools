import { UiSpan, formatSpanForUi, getSpanName } from "./format-spans-for-ui";
import { ReactiveMap } from "@solid-primitives/map";
import { Span } from "../connection/monitor";
import { useCalls, Durations } from "~/components/span/calls-context";
import { SetStoreFunction } from "solid-js/store";

export function updateUiSpansFromStream(incomingSpans: Span[]) {
  const callsContext = useCalls();
  const uiSpansMap = callsContext.spans;

  let spanPointer = callsContext.spanPointer;

  const numberOfFormattedSpans = spanPointer;
  const numberOfIncomingSpans = incomingSpans.length;

  // If we don't have new spans we return
  if (numberOfIncomingSpans <= numberOfFormattedSpans) return;

  // We only process spans we have not processed before
  for (spanPointer; spanPointer < numberOfIncomingSpans; spanPointer++) {
    const incomingSpan = incomingSpans[spanPointer];

    const newUiSpan = formatSpanForUi(incomingSpan);

    if (uiSpansMap.get(incomingSpan.id)) throw Error("we have this already");

    uiSpansMap.set(incomingSpan.id, newUiSpan);

    if (newUiSpan.parentId) {
      attachToParentSpan(newUiSpan.id, newUiSpan.parentId, uiSpansMap);
      triggerRenameOnRoot(newUiSpan, uiSpansMap);
    }

    if (newUiSpan.isProcessing) {
      attachUpdateInterval(newUiSpan.id, uiSpansMap, callsContext.durations);
    }
    updateDurations(spanPointer, newUiSpan, callsContext.durations);
  }
  callsContext.spanPointer = spanPointer;
}

function updateDurations(
  spanPointer: number,
  incomingSpan: UiSpan,
  durationsStore: {
    durations: Durations;
    setDurations: SetStoreFunction<Durations>;
  }
) {
  const { durations, setDurations } = durationsStore;

  const updateDurations: {
    start?: number;
    end?: number;
    average?: number;
    shortestTime?: number;
    longestTime?: number;
    counted?: number;
  } = {};

  if (spanPointer === 0) {
    updateDurations.start = incomingSpan.original.createdAt;
  }

  if (incomingSpan.original.closedAt > 0) {
    updateDurations.end = incomingSpan.original.closedAt;

    if (incomingSpan.kind) {
      const spanDuration =
        incomingSpan.original.closedAt - incomingSpan.original.createdAt;
      const newAverage =
        (durations.average * durations.counted + spanDuration) /
        (durations.counted + 1);

      updateDurations.counted = durations.counted + 1;
      updateDurations.average = newAverage;
    }
  }

  if (incomingSpan.kind) {
    if (!durations.shortestTime || durations.shortestTime > incomingSpan.time)
      updateDurations.shortestTime = incomingSpan.time;

    if (!durations.longestTime || durations.longestTime < incomingSpan.time)
      updateDurations.longestTime = incomingSpan.time;
  }

  setDurations(updateDurations);
}

function attachToParentSpan(
  spanId: bigint,
  parentId: bigint,
  uiSpansMap: ReactiveMap<bigint, UiSpan>
) {
  const parentSpan = uiSpansMap.get(parentId);
  if (parentSpan) {
    parentSpan.children = [...parentSpan.children, spanId];
    uiSpansMap.set(parentSpan.id, parentSpan);
  }
}

function triggerRenameOnRoot(
  span: UiSpan,
  uiSpansMap: ReactiveMap<bigint, UiSpan>
) {
  if (span.kind) {
    span.name = getSpanName(span) ?? span.name;
    uiSpansMap.set(span.id, span);
    return;
  }

  if (span.parentId) {
    const parentSpan = uiSpansMap.get(span.parentId);
    if (parentSpan) triggerRenameOnRoot(parentSpan, uiSpansMap);
  }

  return;
}

function attachUpdateInterval(
  spanId: bigint,
  uiSpansMap: ReactiveMap<bigint, UiSpan>,
  durationsStore: {
    durations: Durations;
    setDurations: SetStoreFunction<Durations>;
  }
) {
  const { durations, setDurations } = durationsStore;
  const interval = setInterval(() => {
    const currentValue = uiSpansMap.get(spanId);
    if (!currentValue) return;

    const isProcessing = currentValue.original.closedAt < 0;
    const time = !isProcessing
      ? (currentValue.original.closedAt - currentValue.original.createdAt) / 1e6
      : Date.now() - currentValue.original.createdAt / 1e6;

    currentValue.time = time;
    currentValue.isProcessing = isProcessing;

    const duration =
      currentValue.original.duration === -1
        ? Date.now() * 1e6 - currentValue.original.createdAt
        : currentValue.original.duration;

    currentValue.duration = duration;

    if (
      durations.end <
      currentValue.duration + currentValue.original.createdAt
    ) {
      setDurations({
        end: currentValue.duration + currentValue.original.createdAt,
      });
    }

    uiSpansMap.set(currentValue.id, {
      ...currentValue,
    });

    if (!isProcessing) {
      clearInterval(interval);
    }
  }, 10);
}
