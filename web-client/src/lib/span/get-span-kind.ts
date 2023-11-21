import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: Span;
};

export function getSpanKind({ metadata, span }: Options) {
  const spanMetadata = metadata.get(span.metadataId);
  if (spanMetadata) {
    switch (spanMetadata.name) {
      case "wry::ipc::handle":
        return "ipc";
      case "app::emit::all":
      case "app::emit::filter":
      case "app::emit::to":
      case "app::emit::rust":
      case "window::emit::all":
      case "window::emit::to":
        return "event";
    }
  }
  return null;
}
