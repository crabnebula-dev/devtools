import type { LogEvent as ILogEvent } from "~/lib/proto/logs";
import { LogEvent } from "~/components/console/log-event";
import { Show, For } from "solid-js";

export function AssociatedLogs(props: { logs: ILogEvent[] }) {
  return (
    <Show when={props.logs.length}>
      <div class="grid gap-2 border-gray-800 border-b">
        <h2 class="text-xl p-4 border-gray-800 border-b">
          Logs ({props.logs.length})
        </h2>
        <For each={props.logs}>
          {(log, idx) => (
            <LogEvent
              event={log}
              showAttributes={true}
              showTimestamp={true}
              odd={idx() % 2 == 0}
            />
          )}
        </For>
      </div>
    </Show>
  );
}
