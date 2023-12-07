import { Show, For, createEffect, Switch, Match } from "solid-js";
import { ConfigurationValue } from "./configuration-value";
import { ConfigurationTooltip } from "./configuration-tooltip";
import {
  generateDescriptions,
  retrieveConfigurationByKey,
} from "~/lib/tauri/tauri-conf-schema";
import { useParams } from "@solidjs/router";
import { ConfigurationErrors } from "./configuration-errors";
import { MissingConfigurationParameterDialog } from "./dialogs/missing-configuration-parameter-dialog";
import { MissingConfigurationDialog } from "./dialogs/missing-configuration-dialog";

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
    return undefined;
  };

  const tabWithKeys = (currentTab: ReturnType<typeof tab>) => {
    if (!currentTab || !(Object.keys(currentTab).length > 0)) return undefined;
    return currentTab;
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
      <Show when={tabWithKeys(tab())}>
        {(t) => (
          <>
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
                  value={t()}
                />
              }
            >
              <Match when={typeof tab() === "object"}>
                <For each={Object.entries(t())}>
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
          </>
        )}
      </Show>

      <Show when={params.config && !config()}>
        <MissingConfigurationDialog config={params.config} />
      </Show>
      <Show when={params.config && config() && params.selected && !tab()}>
        <MissingConfigurationParameterDialog
          config={params.config}
          selectedParameter={params.selected}
        />
      </Show>
    </div>
  );
}
