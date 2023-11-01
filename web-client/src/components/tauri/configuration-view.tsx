import { Show, For } from "solid-js";
import { ConfigurationValue } from "./configuration-value";
import { ConfigurationTooltip } from "./configuration-tooltip";

export function ConfigurationView(props: {
  tab: [string, object] | undefined;
}) {
  const currentTabName = () => props.tab[0];
  return (
    <Show when={props.tab} fallback={"Waiting for tab..."}>
      <header>
        <h1 class="text-5xl pb-8 text-white">
          <ConfigurationTooltip parentKey="" key={currentTabName()} />
        </h1>
      </header>
      <For each={Object.entries(props.tab![1])}>
        {([key, value]) => (
          <ConfigurationValue
            parentKey={props.tab![0]}
            key={key}
            value={value}
          />
        )}
      </For>
    </Show>
  );
}
