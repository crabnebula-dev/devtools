import { type Span } from "~/lib/connection/monitor";
import { type SpanEvent } from "~/lib/proto/spans";
import { findSpanById } from "~/lib/span/find-span-by-id";

export function updatedSpans(spans: Span[], spanEvents: SpanEvent[]) {
  const currentSpans = [...spans];

  for (const event of spanEvents) {
    switch (event.event.oneofKind) {
      case "newSpan": {
        const span = {
          id: event.event.newSpan.id,
          metadataId: event.event.newSpan.metadataId,
          fields: event.event.newSpan.fields,
          children: [],
          createdAt: event.event.newSpan.at,
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
        if (span) {
          span.enteredAt = event.event.enterSpan.at;
        }

        break;
      }
      case "exitSpan": {
        const span = findSpanById(currentSpans, event.event.exitSpan.spanId);
        if (span) {
          span.enteredAt = event.event.exitSpan.at;
        }
        break;
      }

      /**
       * @todo
       * closeSpan must be handled and used still.
       */
      case "closeSpan":
        break;

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
