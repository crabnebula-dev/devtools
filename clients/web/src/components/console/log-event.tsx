import { Show } from "solid-js";
import clsx from "clsx";
import { processLogEventForView } from "~/lib/console/process-log-event-for-view";
import type { LogEvent as ILogEvent } from "~/lib/proto/logs";
import { Fields } from "./log-event/fields";
import { Timestamp } from "./log-event/timestamp";
import { Message } from "./log-event/message";
import { Source } from "./log-event/source";

export function LogEvent(props: {
  event: ILogEvent;
  showLinks?: boolean;
  showAttributes?: boolean;
  showTimestamp?: boolean;
  odd?: boolean;
}) {
  return (
    <Show when={processLogEventForView(props.event)}>
      {(processedEvent) => (
        <div
          class={clsx(
            "p-1  font-mono text-sm items-center flex gap-8 group",
            processedEvent().levelStyle
              ? processedEvent().levelStyle
              : "border-b-gray-800 text-white",
            props.odd ? "" : "bg-slate-900",
          )}
        >
          <Timestamp
            processedEvent={processedEvent()}
            show={props.showTimestamp}
          />

          <Message
            processedEvent={processedEvent()}
            showLinks={props.showLinks}
          />

          <Fields
            processedEvent={processedEvent()}
            show={props.showAttributes}
          />

          <Source processedEvent={processedEvent()} />
        </div>
      )}
    </Show>
  );
}
