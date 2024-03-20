import { Show } from "solid-js";
import { formatTimestamp } from "~/lib/formatters";
import type { LogEvent } from "~/lib/proto/logs";
import clsx from "clsx";
import { getFileLineFromLocation } from "~/lib/console/get-file-line-from-location";
import { processLogEventForView } from "~/lib/console/process-log-event-for-view";
import { Field } from "~/lib/proto/common";
import { processFieldValue } from "~/lib/span/process-field-value";
import { A, useParams } from "@solidjs/router";

function displayField(field: Field) {
  return (
    <span class="group-hover:text-slate-300 text-slate-500 transition-colors hackathon">
      <span class="fname">{field.name}</span>
      <span class="fequal"> = </span>
      <span class="fval group-hover:text-slate-100 text-slate-300 transition-colors">
        {processFieldValue(field.value)}
      </span>
    </span>
  );
}

export function LogEventEntry(props: {
  event: LogEvent;
  showLinks?: boolean;
  showAttributes?: boolean;
  showTimestamp?: boolean;
  odd?: boolean;
}) {
  const { host, port } = useParams();
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
          <Show when={props.showLinks && processedEvent().parent}>
            <A
              href={`/dash/${host}/${port}/calls?span=${processedEvent().parent}`}
              class="text-slate-100 group-hover:text-white"
            >
              🔗
            </A>
          </Show>
          <Show when={processedEvent().message.length}>
            <span class="group-hover:text-white text-slate-300 transition-colors">
              {processedEvent().message}
            </span>
          </Show>
          <Show when={props.showAttributes}>
            {processedEvent().fields.map(displayField)}
          </Show>
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
