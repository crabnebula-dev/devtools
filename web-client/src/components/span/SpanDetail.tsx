import { useMonitor } from "~/lib/connection/monitor";
import { useSearchParams } from "@solidjs/router";
import { IpcSpanDetail } from "./IpcSpanDetail";
import { getSpanKind } from "~/lib/span/getSpanKind";
import { Match, Switch } from "solid-js";
import { recursivelyFindSpanById } from "~/lib/span/recursivelyFindSpanById";
import { EventSpanDetail } from "./EventSpanDetail";

export function SpanDetail() {
  const [searchParams] = useSearchParams();
  const { monitorData } = useMonitor();
  const spanId = () => BigInt(searchParams.span);
  const spanKind = () => {
    const span = recursivelyFindSpanById(monitorData.spans, spanId());
    if (span) {
      return getSpanKind({ metadata: monitorData.metadata, span });
    }
    return undefined
  };

  return (
    <Switch fallback={<p>Unknown span kind: {spanKind()}</p>}>
      <Match when={spanKind() === "ipc"}>
        <IpcSpanDetail />
      </Match>
      <Match when={spanKind() === "event"}>
        <EventSpanDetail />
      </Match>
    </Switch>
  );
}
