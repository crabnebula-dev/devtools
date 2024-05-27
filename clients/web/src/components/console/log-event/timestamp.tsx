import clsx from "clsx";
import type { ProcessedLogEvent } from "~/lib/console/process-log-event-for-view";
import { formatTimestamp } from "~/lib/formatters";
import { Show } from "solid-js";

export function Timestamp(props: {
  processedEvent: ProcessedLogEvent;
  show: boolean | undefined;
}) {
  return (
    <Show when={props.show}>
      <time
        dateTime={props.processedEvent.timeDate.toISOString()}
        class={clsx(
          props.processedEvent.levelStyle
            ? props.processedEvent.levelStyle
            : "text-slate-400 group-hover:text-slate-100",
          "font-mono text-xs transition-colors",
        )}
      >
        {formatTimestamp(props.processedEvent.timeDate)}
      </time>
    </Show>
  );
}
