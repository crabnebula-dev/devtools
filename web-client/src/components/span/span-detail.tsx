import { useMonitor } from "~/lib/connection/monitor";
import { useSearchParams } from "@solidjs/router";
import { IpcSpanDetail } from "./ipc-span-detail";
import { getSpanKind } from "~/lib/span/get-span-kind";
import { Match, Switch } from "solid-js";
import { EventSpanDetail } from "./event-span-detail";

export function SpanDetail() {
  const [searchParams] = useSearchParams();
  const { monitorData } = useMonitor();
  const spanId = () => BigInt(searchParams.span);
  const spanKind = () => {
    const span = monitorData.spans.find((s) => s.id === spanId());
    if (span) {
      return getSpanKind({ metadata: monitorData.metadata, span });
    }
    return undefined;
  };

  return (
    <Switch fallback={<p>Unknown span kind: {spanKind()}</p>}>
      <Match when={spanKind() === "ipc"}>
        <IpcSpanDetail spanId={spanId()} />
      </Match>
      <Match when={spanKind() === "event"}>
        <EventSpanDetail spanId={spanId()} />
      </Match>
    </Switch>
  );
}
