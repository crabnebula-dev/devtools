import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";

const emitSpanNames = [
  "app::emit::all",
  "app::emit::filter",
  "app::emit::to",
  "app::emit::rust",
  "window::emit",
  "window::trigger",
  "window::emit::to",
  "window::emit::all",
];

type Options = {
  metadata: Map<bigint, Metadata>;
  span: Span;
};

export function isEventSpan({ metadata, span }: Options) {
  return emitSpanNames.includes(metadata.get(span.metadataId)?.name ?? "");
}
