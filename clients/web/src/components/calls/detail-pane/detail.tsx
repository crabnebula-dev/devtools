import { createMemo, createSignal } from "solid-js";
import { Span } from "~/lib/connection/monitor";
import { treeEntries } from "~/lib/span/get-span-children";
import { Metadata_Level } from "~/lib/proto/common";
import { useMonitor } from "~/context/monitor-provider";
import { Args } from "./args";
import { Header } from "./header";
import { Traces } from "./traces";
import { AssociatedLogs } from "./associated-logs";
import { IpcResponse } from "./ipc-response";

export function Detail(props: { call: Span }) {
  const { monitorData } = useMonitor();

  const [minLevel, setMinLevel] = createSignal<Metadata_Level>(
    Metadata_Level.TRACE,
  );

  const children = createMemo(() => {
    const level = minLevel();
    return treeEntries(
      props.call,
      (span) => span.metadata && span.metadata.level <= level,
    );
  });

  const includedSpans = createMemo(
    () => new Set(children().map((n) => n.span.id)),
  );

  const associatedLogs = createMemo(() => {
    const spanIds = includedSpans();
    return monitorData.logs.filter(
      (log) => log.parent && spanIds.has(log.parent),
    );
  });

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800 min-w-[420px]">
      <Header call={props.call} />
      <Args call={props.call} />
      <IpcResponse response={props.call.ipcData?.response} />
      <AssociatedLogs logs={associatedLogs()} />
      <Traces
        minLevel={minLevel()}
        setMinLevel={setMinLevel}
        spanChildren={children()}
      />
    </div>
  );
}
