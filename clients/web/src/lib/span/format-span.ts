import { createSignal } from "solid-js";
import { Metadata } from "../proto/common";
import type { Span } from "../connection/monitor";
import type { SpanEvent_Span } from "../proto/spans";
import { convertTimestampToNanoseconds } from "../formatters";
import { IpcData } from "../connection/monitor";

export function formatSpan(
  spanEvent: SpanEvent_Span,
  metadata: Map<bigint, Metadata>,
) {
  const createdAt = spanEvent.at
    ? convertTimestampToNanoseconds(spanEvent.at)
    : -1;

  const spanMetadata = metadata.get(spanEvent.metadataId);

  const [children, setChildren] = createSignal<Span[]>([]);
  const [ipcData, setIpcData] = createSignal<IpcData>();
  const span: Span = {
    id: spanEvent.id,
    name: spanMetadata?.name ?? "-", // NOTE: this is a fallback
    parentId: spanEvent.parent,
    metadataId: spanEvent.metadataId,
    metadata: spanMetadata,
    fields: spanEvent.fields,
    createdAt: createdAt,
    enters: [],
    exits: [],
    initiated: createdAt / 1000000,
    time: -1,
    duration: -1,
    isProcessing: true,
    get children() {
      return children();
    },
    set children(spans: Span[]) {
      setChildren(spans);
    },
    get ipcData(): IpcData | undefined {
      return ipcData();
    },
    set ipcData(data: IpcData) {
      setIpcData(data);
    },
    closedAt: -1,
    aborted: false,
    hasError: null,
  };

  return span;
}
