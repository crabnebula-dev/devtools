import { For, createEffect, Switch, Match } from "solid-js";
import { ConfigurationValue } from "./configuration-value";
import { ConfigurationTooltip } from "./configuration-tooltip";
import { generateDescriptions } from "~/lib/tauri/tauri-conf-lib";
import { retrieveConfigurationByKey } from "~/lib/tauri/config/retrieve-configurations";
import { useParams } from "@solidjs/router";
import { ConfigurationErrors } from "./configuration-errors";
import { MissingConfigurationParameterDialog } from "./dialogs/missing-configuration-parameter-dialog";
import { MissingConfigurationDialog } from "./dialogs/missing-configuration-dialog";
import { Heading } from "../heading";
import { TauriConfig } from "~/lib/tauri/config/tauri-conf";

export function ConfigurationView() {
  const params = useParams<{
    config:
      | "loaded"
      | "tauri.conf.json"
      | "tauri.windows.conf"
      | "tauri.linux.conf"
      | "tauri.macos.conf";
    selected: keyof TauriConfig;
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
    <div class="p-4 h-full">
      <Switch
        fallback={
          <div class="h-full grid gap-4 text-center content-center justify-center items-center p-4">
            <Heading>No Configuration Selected</Heading>
            &larr; Use the sidebar to get started.
          </div>
        }
      >
        <Match when={params.config && !params.selected && config()}>
          <h1 class="text-3xl">{config()?.label}</h1>
          <ConfigurationErrors error={config()?.error} />
        </Match>
        <Match when={tabWithKeys(tab())}>
          {(t) => (
            <>
              <header>
                <h1 class="text-3xl pb-8 text-white">
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
        </Match>
        <Match when={params.config && !config()}>
          <MissingConfigurationDialog config={params.config} />
        </Match>
        <Match when={params.config && config() && params.selected && !tab()}>
          <MissingConfigurationParameterDialog
            config={params.config}
            selectedParameter={params.selected}
          />
        </Match>
      </Switch>
    </div>
  );
}
