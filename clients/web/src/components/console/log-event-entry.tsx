import { Show, untrack } from "solid-js";
import { getLogMetadata } from "~/lib/console/get-log-metadata";
import { timestampToDate, formatTimestamp } from "~/lib/formatters";
import { getLevelClasses } from "~/lib/console/get-level-classes";
import { useMonitor } from "~/context/monitor-provider";
import { processFieldValue } from "~/lib/span/process-field-value";
import type { LogEvent } from "~/lib/proto/logs";
import clsx from "clsx";
import { getFileLineFromLocation } from "~/lib/console/get-file-line-from-location";

export function LogEventEntry(props: {
  event: LogEvent;
  showTimestamp?: boolean;
  odd?: boolean;
}) {
  const { monitorData } = useMonitor();
  const logEvent = untrack(() => props.event);
  const { message, at } = logEvent;
  if (!at) return null;

  const metadata = getLogMetadata(monitorData, logEvent);
  const timeDate = timestampToDate(at);
  const levelStyle = getLevelClasses(metadata?.level);

  let target = metadata?.target;
  if (target === "log") {
    const field = logEvent.fields.find((field) => field.name === "log.target");
    if (field) {
      target = processFieldValue(field.value);
    }
  }

  return (
    <div
      class={clsx(
        "p-1  font-mono text-sm items-center flex gap-4 group",
        levelStyle ? levelStyle : "border-b-gray-800 text-white",
        props.odd ? "" : "bg-slate-900",
      )}
    >
      <Show when={props.showTimestamp}>
        <time
          dateTime={timeDate.toISOString()}
          class={clsx(
            levelStyle
              ? levelStyle
              : "text-slate-400 group-hover:text-slate-100",
            "font-mono text-xs transition-colors",
          )}
        >
          {formatTimestamp(timeDate)}
        </time>
      </Show>
      <span class="group-hover:text-white text-slate-300 transition-colors">
        {message}
      </span>
      <span class="ml-auto flex gap-2 items-center text-xs">
        <Show when={target}>
          {(logTarget) => (
            <span class="text-slate-400 group-hover:text-slate-100 transition-colors">
              {logTarget()}
            </span>
          )}
        </Show>
        <Show when={getFileLineFromLocation(metadata?.location)}>
          {(line) => <span>{line()}</span>}
        </Show>
      </span>
    </div>
  );
}
