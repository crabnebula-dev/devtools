import { Show, For } from "solid-js";
import { ConfigurationValue } from "./configuration-value";
import { ConfigurationTooltip } from "./configuration-tooltip";

export function ConfigurationTab(props: { tab: [string, object] | undefined }) {
  return (
    <Show when={props.tab} fallback={"Waiting for tab..."}>
      <header>
        <h1 class="text-5xl text-neutral-400">
          <ConfigurationTooltip parentKey="" key={props.tab![0]} />
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
