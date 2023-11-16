import { Show, For, createEffect } from "solid-js";
import { ConfigurationValue } from "./configuration-value";
import { ConfigurationTooltip } from "./configuration-tooltip";
import {
  generateDescriptions,
  retrieveConfigurationByPathAndKey,
} from "~/lib/tauri/tauri-conf-schema";
import { useParams } from "@solidjs/router";

export function ConfigurationView() {
  const params = useParams<{
    config: string;
    selected: "build" | "package" | "plugins" | "tauri";
  }>();

  const tab = () =>
    retrieveConfigurationByPathAndKey(params.config, params.selected);

  createEffect(() => {
    const data = tab();
    if (!data) return;
    generateDescriptions(params.selected, data);
  });

  return (
    <Show when={tab()}>
      <div class="p-4">
        <header>
          <h1 class="text-5xl pb-8 text-white">
            <ConfigurationTooltip parentKey="" key={params.selected} />
          </h1>
        </header>
        <For each={Object.entries(tab()!)}>
          {([key, value]) => (
            <ConfigurationValue
              parentKey={params.selected}
              key={key}
              value={value}
            />
          )}
        </For>
      </div>
    </Show>
  );
}
