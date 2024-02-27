import { getSpanName, getSpanNameByMetadata } from "./format-spans-for-ui";
import { getSpanKindByMetadata } from "./get-span-kind";
import { ReactiveMap } from "@solid-primitives/map";
import { Span } from "../connection/monitor";
import { useCalls, Durations } from "~/components/span/calls-context";
import { SetStoreFunction } from "solid-js/store";
import { useMonitor } from "~/context/monitor-provider";

export function updateUiSpansFromStream(incomingSpans: Map<bigint, Span>) {
  const { monitorData } = useMonitor();
  const callsContext = useCalls();
  const uiSpansMap = callsContext.spans;

  let spanPointer = callsContext.spanPointer;

  const numberOfFormattedSpans = spanPointer;
  const numberOfIncomingSpans = incomingSpans.size;

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

    // Make sure to only attach intervals if we are still connected to the stream
    if (newUiSpan.isProcessing && monitorData.health === 1) {
      attachUpdateInterval(
        newUiSpan.id,
        uiSpansMap,
        callsContext.durations,
        callsContext.runningIntervals
      );
    }
    updateDurations(spanPointer, newUiSpan, callsContext.durations);
  }
  callsContext.spanPointer = spanPointer;
}

export function updateDurations(
  incomingSpan: Span,
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

  if (!durations.start) {
    updateDurations.start = incomingSpan.createdAt;
  }

  if (incomingSpan.closedAt > 0) {
    updateDurations.end = incomingSpan.closedAt;

    if (incomingSpan.kind) {
      const spanDuration = incomingSpan.closedAt - incomingSpan.createdAt;
      const newAverage =
        (durations.average * durations.counted + spanDuration) /
        (durations.counted + 1);

      updateDurations.counted = durations.counted + 1;
      updateDurations.average = newAverage;

      if (
        !durations.shortestTime ||
        (incomingSpan.time && durations.shortestTime > incomingSpan.time)
      )
        updateDurations.shortestTime = incomingSpan.time;

      if (!durations.longestTime || durations.longestTime < incomingSpan.time)
        updateDurations.longestTime = incomingSpan.time;
    }
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

export function triggerRenameOnRoot(
  span: Span,
  uiSpansMap: ReactiveMap<bigint, Span>
) {
  span.kind = span.kind ? span.kind : getSpanKindByMetadata(span) ?? span.kind;
  span.name = getSpanNameByMetadata(span) ?? span.name;
  //uiSpansMap.set(span.id, span);

  if (span.parentId) {
    const parentSpan = uiSpansMap.get(span.parentId);
    if (parentSpan) triggerRenameOnRoot(parentSpan, uiSpansMap);
  }

  return;
}

export function attachUpdateInterval(
  spanId: bigint,
  uiSpansMap: ReactiveMap<bigint, Span>,
  durationsStore: {
    durations: Durations;
    setDurations: SetStoreFunction<Durations>;
  }
) {
  const { durations, setDurations } = durationsStore;
  const interval = setInterval(() => {
    const currentValue = uiSpansMap.get(spanId);
    if (!currentValue) return;

    const isProcessing = currentValue.closedAt < 0;
    const time = !isProcessing
      ? (currentValue.closedAt - currentValue.createdAt) / 1e6
      : Date.now() - currentValue.createdAt / 1e6;

    currentValue.time = time;
    currentValue.isProcessing = isProcessing;

    const duration =
      currentValue.duration === -1
        ? Date.now() * 1e6 - currentValue.createdAt
        : currentValue.duration;

    currentValue.duration = duration;

    if (durations.end < currentValue.duration + currentValue.createdAt) {
      setDurations({
        end: currentValue.duration + currentValue.createdAt,
      });
    }

    uiSpansMap.set(currentValue.id, {
      ...currentValue,
    });

    if (!isProcessing) {
      clearInterval(interval);
    }
  }, 10);

  const currentValue = uiSpansMap.get(spanId);
  if (!currentValue) return;
  currentValue.interval = interval;
  uiSpansMap.set(currentValue?.id, currentValue);
}
