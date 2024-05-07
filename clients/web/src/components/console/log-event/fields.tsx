import { ProcessedLogEvent } from "~/lib/console/process-log-event-for-view";
import { Show, For } from "solid-js";
import { Field } from "./field";

export function Fields(props: {
  processedEvent: ProcessedLogEvent;
  show: boolean | undefined;
}) {
  return (
    <Show when={props.show}>
      <For each={props.processedEvent.fields}>
        {(field) => <Field field={field} />}
      </For>
    </Show>
  );
}
