import { Show, For, createEffect, Switch, Match } from "solid-js";
import { ConfigurationValue } from "./configuration-value";
import { ConfigurationTooltip } from "./configuration-tooltip";
import {
  generateDescriptions,
  retrieveConfigurationByKey,
} from "~/lib/tauri/tauri-conf-schema";
import { useParams } from "@solidjs/router";
import { ConfigurationErrors } from "./configuration-errors";

export function ConfigurationView() {
  const params = useParams<{
    config:
      | "loaded"
      | "tauri.conf.json"
      | "tauri.windows.conf"
      | "tauri.linux.conf"
      | "tauri.macos.conf";
    selected: "build" | "package" | "plugins" | "tauri";
  }>();

  const config = () => retrieveConfigurationByKey(params.config);

  const tab = () => {
    const config = retrieveConfigurationByKey(params.config);
    if (config && config.data && config.data[params.selected])
      return config.data[params.selected];
    return {};
  };
  createEffect(() => {
    const data = tab();
    if (!data) return;
    generateDescriptions(params.selected, data);
  });

  return (
    <div class="p-4">
      <Show when={params.config && !params.selected && config()}>
        <h1 class="text-3xl">{config()?.label}</h1>
        <ConfigurationErrors error={config()?.error} />
      </Show>
      <Show when={Object.keys(tab()).length > 0}>
        <header>
          <h1 class="text-5xl pb-8 text-white">
            <ConfigurationTooltip parentKey="" key={params.selected} />
          </h1>
        </header>
        <Switch
          fallback={
            <ConfigurationValue
              parentKey=""
              key={params.selected}
              value={tab()}
            />
          }
        >
          <Match when={typeof tab() === "object"}>
            <For each={Object.entries(tab())}>
              {([key, value]) => (
                <ConfigurationValue
                  parentKey={params.selected}
                  key={key}
                  value={value}
                />
              )}
            </For>
          </Match>
        </Switch>
      </Show>
    </div>
  );
}
