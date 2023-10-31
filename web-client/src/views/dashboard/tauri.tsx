import { For, Show, createSignal, createContext, useContext } from "solid-js";
import { Collapsible } from "@kobalte/core";
import { useMonitor } from "~/lib/connection/monitor";
import { ConfigurationTab } from "~/components/tauri/configuration-tab";
import { buildSchemaMap } from "~/lib/json-scheme-parser";
import { Sidebar } from "~/components/tauri/sidebar";

const DescriptionsContext = createContext<Map<string, any>>();

export function useDescriptions() {
  const ctx = useContext(DescriptionsContext);
  if (!ctx) throw new Error("Could not load descriptions for config");
  return ctx;
}

export default function TauriConfig() {
  const { monitorData } = useMonitor();

  const descriptions = buildSchemaMap(
    monitorData.schema!,
    monitorData.tauriConfig!
  );

  // build config array we can iterate over and remove empty entries
  const nav = Object.entries(monitorData.tauriConfig!).filter(
    ([_, entries]) => typeof entries === "object"
  );

  const [currentNavElement, setCurrentNavElement] = createSignal(
    nav.length > 0 ? nav[0] : undefined
  );

  return (
    <DescriptionsContext.Provider value={descriptions}>
      <div class="flex min-h-[-webkit-fill-available]">
        <Sidebar nav={nav} setCurrentNavElement={setCurrentNavElement} />
        <section class="p-4">
          <Show when={monitorData.tauriConfig?.package}>
            {(pkg) => (
              <header class="my-8 text-3xl">
                <h2 class="text-neutral-300">
                  Inspecting config for:{" "}
                  <span class="font-mono text-white">
                    {pkg().productName} - v{pkg().version}
                  </span>
                </h2>
              </header>
            )}
          </Show>

          <Show when={currentNavElement()}>
            <ConfigurationTab tab={currentNavElement()} />
          </Show>

          <section class="mt-4">
            <Collapsible.Root>
              <Collapsible.Trigger>
                <h3 class="text-2xl text-neutral-400">show JSON source</h3>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <pre class="text-white">
                  {/* {JSON.stringify(tauriConfig()?.result.tauri, null, 2)} */}
                  {JSON.stringify(monitorData.tauriConfig, null, 2)}
                </pre>
              </Collapsible.Content>
            </Collapsible.Root>
          </section>
        </section>
      </div>
    </DescriptionsContext.Provider>
  );
}
