import { type Span } from "~/lib/connection/monitor";
import { type SpanEvent } from "~/lib/proto/spans";
import { findSpanById } from "~/lib/span/find-span-by-id";

export function updatedSpans(currentSpans: Span[], spanEvents: SpanEvent[]) {
  for (const event of spanEvents) {
    switch (event.event.oneofKind) {
      case "newSpan": {
        const span = {
          id: event.event.newSpan.id,
          metadataId: event.event.newSpan.metadataId,
          fields: event.event.newSpan.fields,
          children: [],
          createdAt: event.event.newSpan.at,
          activity: [],
          pendingActivity: null,
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
        const enteredAt = event.event.enterSpan.at;
        if (span && enteredAt) {
          if (span.pendingActivity) {
            span.activity.push({
              enteredAt,
              exitedAt: span.pendingActivity.timestamp
            });
            span.pendingActivity = null;
          } else {
            span.pendingActivity = { timestamp: enteredAt };
          }
        }

        break;
      }
      case "exitSpan": {
        const span = findSpanById(currentSpans, event.event.exitSpan.spanId);
        const exitedAt = event.event.exitSpan.at;
        if (span && exitedAt) {
          if (span.pendingActivity) {
            span.activity.push({
              enteredAt: span.pendingActivity.timestamp,
              exitedAt
            });
            span.pendingActivity = null;
          } else {
            span.pendingActivity = { timestamp: exitedAt };
          }
        }
        break;
      }

      case "closeSpan": {
        const span = findSpanById(currentSpans, event.event.closeSpan.spanId);
        if (span) {
          span.closedAt = event.event.closeSpan.at;
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
