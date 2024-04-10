import type { LogEvent as ILogEvent } from "~/lib/proto/logs";
import { LogEvent } from "~/components/console/log-event";
import { Show } from "solid-js";
import { VirtualList } from "~/components/virtual-list";

export function AssociatedLogs(props: { logs: ILogEvent[] }) {
  return (
    <Show when={props.logs.length}>
      <div class="grid gap-2 border-gray-800 border-b">
        <h2 class="text-xl p-4 border-gray-800 border-b">
          Logs ({props.logs.length})
        </h2>
        <VirtualList
          class="max-h-[400px] overflow-x-auto"
          dataStream={props.logs}
          estimateSize={28}
          overscan={25}
        >
          {(item, index) => (
            <LogEvent
              event={item}
              showAttributes={true}
              showTimestamp={true}
              odd={index % 2 == 0}
            />
          )}
        </VirtualList>
      </div>
    </Show>
  );
}
