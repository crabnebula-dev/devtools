import { Show, For } from "solid-js";
import { ConfigurationValue } from "./configuration-value";
import { buildSchemaMap } from "~/lib/json-scheme-parser";
import { useMonitor } from "~/lib/connection/monitor";

export function ConfigurationTab(props) {
  const { monitorData } = useMonitor();
  const schema = monitorData.schema;

  return (
    <Show when={props.tab} fallback={"Waiting for tab..."}>
      <header>
        <h1 class="text-5xl text-neutral-400">{props.tab![0]}</h1>
      </header>
      <For each={Object.entries(props.tab[1])}>
        {([key, value]) => (
          <ConfigurationValue
            parentKey={props.tab![0]}
            key={key}
            value={value}
            description={props.descriptions}
          />
        )}
      </For>
    </Show>
  );
}
