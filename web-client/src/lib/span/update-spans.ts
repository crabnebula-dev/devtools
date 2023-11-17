import { type Span } from "~/lib/connection/monitor";
import { type SpanEvent } from "~/lib/proto/spans";
import { convertTimestampToNanoseconds } from "../formatters";

export function updatedSpans(currentSpans: Span[], spanEvents: SpanEvent[]) {
  for (const event of spanEvents) {
    switch (event.event.oneofKind) {
      case "newSpan": {
        const span: Span = {
          id: event.event.newSpan.id,
          parentId: event.event.newSpan.parent,
          metadataId: event.event.newSpan.metadataId,
          fields: event.event.newSpan.fields,
          createdAt: convertTimestampToNanoseconds(event.event.newSpan.at!),
          enters: [],
          exits: [],
          closedAt: -1,
          duration: -1,
        };

        currentSpans.push(span);

        break;
      }
      case "enterSpan": {
        const spanId = event.event.enterSpan.spanId;
        const span = currentSpans.find((s) => s.id === spanId);
        const enteredAt = convertTimestampToNanoseconds(
          event.event.enterSpan.at!
        );
        if (span) {
          span.enters.push(enteredAt);
        }

        break;
      }
      case "exitSpan": {
        const spanId = event.event.exitSpan.spanId;
        const span = currentSpans.find((s) => s.id === spanId);
        const exitedAt = convertTimestampToNanoseconds(
          event.event.exitSpan.at!
        );
        if (span) {
          span.exits.push(exitedAt);
        }
        break;
      }

      case "closeSpan": {
        const spanId = event.event.closeSpan.spanId;
        const span = currentSpans.find((s) => s.id === spanId);
        if (span) {
          span.closedAt = convertTimestampToNanoseconds(
            event.event.closeSpan.at!
          );
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
