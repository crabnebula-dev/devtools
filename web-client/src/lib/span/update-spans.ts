import { type Span } from "~/lib/connection/monitor";
import { type SpanEvent } from "~/lib/proto/spans";
import { findSpanById } from "~/lib/span/find-span-by-id";
import { convertTimestampToNanoseconds } from "../formatters";

export function updatedSpans(currentSpans: Span[], spanEvents: SpanEvent[]) {
  for (const event of spanEvents) {
    switch (event.event.oneofKind) {
      case "newSpan": {
        const span: Span = {
          id: event.event.newSpan.id,
          metadataId: event.event.newSpan.metadataId,
          fields: event.event.newSpan.fields,
          children: [],
          createdAt: convertTimestampToNanoseconds(event.event.newSpan.at!),
          enters: [],
          exits: [],
          closedAt: -1,
          duration: -1
        };

        /**
         * check if there's a parent event
         */
        const parent = event.event.newSpan.parent;
        if (parent) {
          const parentSpan = findSpanById(currentSpans, parent);
          if (parentSpan) {
            /**
             * push into parent's tree
             */
            parentSpan.children.push(span);
          }
        } else {
          /**
           * push to root level
           */
          currentSpans.push(span);
        }

        break;
      }
      case "enterSpan": {
        const span = findSpanById(currentSpans, event.event.enterSpan.spanId);
        const enteredAt = convertTimestampToNanoseconds(event.event.enterSpan.at!);
        if (span) {
          span.enters.push(enteredAt);
        }

        break;
      }
      case "exitSpan": {
        const span = findSpanById(currentSpans, event.event.exitSpan.spanId);
        const exitedAt = convertTimestampToNanoseconds(event.event.exitSpan.at!);
        if (span) {
          span.exits.push(exitedAt);
        }
        break;
      }

      case "closeSpan": {
        const span = findSpanById(currentSpans, event.event.closeSpan.spanId);
        if (span) {
          span.closedAt = convertTimestampToNanoseconds(event.event.closeSpan.at!);
          span.duration = span.closedAt - span.createdAt;
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

  return currentSpans;
}
