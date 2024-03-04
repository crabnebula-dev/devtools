import { Span } from "../connection/monitor";
import { getSpanChildren } from "./get-span-children";

export function getSpanChildrenWithFilter(span: Span, filter?: string) {
  return getSpanChildren(span).filter((span) => span.name === filter);
}
