import { Show } from "solid-js";
import { formatTimestamp } from "~/lib/formatters";
import type { LogEvent } from "~/lib/proto/logs";
import clsx from "clsx";
import { getFileLineFromLocation } from "~/lib/console/get-file-line-from-location";
import { processLogEventForView } from "~/lib/console/process-log-event-for-view";

export function LogEventEntry(props: {
  event: LogEvent;
  showTimestamp?: boolean;
  odd?: boolean;
}) {
  return (
    <Show when={processLogEventForView(props.event)}>
      {(processedEvent) => (
        <div
          class={clsx(
            "p-1  font-mono text-sm items-center flex gap-4 group",
            processedEvent().levelStyle
              ? processedEvent().levelStyle
              : "border-b-gray-800 text-white",
            props.odd ? "" : "bg-slate-900",
          )}
        >
          <Show when={props.showTimestamp}>
            <time
              dateTime={processedEvent().timeDate.toISOString()}
              class={clsx(
                processedEvent().levelStyle
                  ? processedEvent().levelStyle
                  : "text-slate-400 group-hover:text-slate-100",
                "font-mono text-xs transition-colors",
              )}
            >
              {formatTimestamp(processedEvent().timeDate)}
            </time>
          </Show>
          <span class="group-hover:text-white text-slate-300 transition-colors">
            {processedEvent().message}
          </span>
          <span class="ml-auto flex gap-2 items-center text-xs">
            <Show when={processedEvent().target}>
              {(logTarget) => (
                <span class="text-slate-400 group-hover:text-slate-100 transition-colors">
                  {logTarget()}
                </span>
              )}
            </Show>
            <Show
              when={getFileLineFromLocation(
                processedEvent().metadata?.location,
              )}
            >
              {(line) => <span>{line()}</span>}
            </Show>
          </span>
        </div>
      )}
    </Show>
  );
}
