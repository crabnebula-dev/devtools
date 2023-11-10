import { Show, For, createEffect } from "solid-js";
import { ConfigurationValue } from "./configuration-value";
import { ConfigurationTooltip } from "./configuration-tooltip";
import { useConfiguration } from "./configuration-context";
import { buildSchemaMap } from "~/lib/tauri/tauri-conf-schema";
import { useMonitor } from "~/lib/connection/monitor";

export function ConfigurationView(props: {
  tab: {
    name: string;
    config: object;
  };
}) {
  const { monitorData } = useMonitor();

  const {
    descriptions: { setDescriptions },
  } = useConfiguration();

  createEffect(() => {
    setDescriptions(
      buildSchemaMap(monitorData.schema ?? {}, {
        [props.tab.name]: props.tab.config,
      })
    );
  });

  return (
    <Show when={props.tab} fallback={"Waiting for tab..."}>
      <header>
        <h1 class="text-5xl pb-8 text-white">
          <ConfigurationTooltip parentKey="" key={props.tab.name} />
        </h1>
      </header>
      <For each={Object.entries(props.tab.config)}>
        {([key, value]) => (
          <ConfigurationValue
            parentKey={props.tab.name}
            key={key}
            value={value}
          />
        )}
      </For>
    </Show>
  );
}
