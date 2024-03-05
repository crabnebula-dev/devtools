import { type Span } from "~/lib/connection/monitor";
import { type SpanEvent } from "~/lib/proto/spans";
import { convertTimestampToNanoseconds } from "../formatters";
import { formatSpanForUiWithMetadata } from "./format-spans-for-ui";
import { Metadata } from "../proto/common";
import { type ReactiveMap } from "@solid-primitives/map";
import { triggerRenameOnRoot } from "./trigger-rename-on-root";
import { Durations } from "~/components/span/calls-context";

export function updatedSpans(
  currentSpans: ReactiveMap<bigint, Span>,
  spanEvents: SpanEvent[],
  metadata: Map<bigint, Metadata>,
  oldDurations: Durations,
) {
  let { start, end, shortestTime, longestTime, average, counted, openSpans } =
    oldDurations;

  for (const event of spanEvents) {
    switch (event.event.oneofKind) {
      case "newSpan": {
        const span: Span = formatSpanForUiWithMetadata(
          event.event.newSpan,
          metadata,
        );

        if (span.parentId) {
          const parent = currentSpans.get(span.parentId);
          if (parent) {
            parent.children.push(span);
            span.parent = parent;
          }

          triggerRenameOnRoot(span, currentSpans);
        }
        currentSpans.set(span.id, span);

        if (!start || span.createdAt < start) start = span.createdAt;

        openSpans++;
        break;
      }
      case "enterSpan": {
        const spanId = event.event.enterSpan.spanId;
        const span = currentSpans.get(spanId);
        const enteredAt = event.event.enterSpan.at
          ? convertTimestampToNanoseconds(event.event.enterSpan.at)
          : -1;
        if (span) {
          span.enters.push({
            timestamp: enteredAt,
            threadID: Number(event.event.enterSpan.threadId),
          });
          currentSpans.set(span.id, span);
        }

        break;
      }
      case "exitSpan": {
        const spanId = event.event.exitSpan.spanId;
        const span = currentSpans.get(spanId);
        const exitedAt = event.event.exitSpan.at
          ? convertTimestampToNanoseconds(event.event.exitSpan.at)
          : -1;
        if (span) {
          span.exits.push({
            timestamp: exitedAt,
            threadID: Number(event.event.exitSpan.threadId),
          });
          currentSpans.set(span.id, span);
        }
        break;
      }

      case "closeSpan": {
        const spanId = event.event.closeSpan.spanId;
        const span = currentSpans.get(spanId);
        if (span) {
          span.closedAt = event.event.closeSpan.at
            ? convertTimestampToNanoseconds(event.event.closeSpan.at)
            : -1;
          span.duration = span.closedAt - span.createdAt;

          span.isProcessing = span.closedAt < 0;

          span.time = !span.isProcessing
            ? span.duration / 1e6
            : Date.now() - span.createdAt / 1e6;

          currentSpans.set(span.id, span);

          if (span.closedAt > end) end = span.closedAt;
          if (!shortestTime || span.duration < shortestTime)
            shortestTime = span.duration;
          if (!longestTime || span.duration > longestTime)
            longestTime = span.duration;

          if (span.kind) {
            average = (average * counted + span.duration) / (counted + 1);
            counted++;
          }

          openSpans--;
        }

        break;
      }

      case "recorded": {
        const spanId = event.event.recorded.spanId;
        const span = currentSpans.get(spanId);
        if (span) {
          span.fields = [...span.fields, ...event.event.recorded.fields];
          currentSpans.set(span.id, span);
        }
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

  return {
    start,
    end,
    longestTime,
    shortestTime,
    average,
    counted,
    openSpans,
  } satisfies Durations;
}
