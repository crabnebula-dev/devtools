import { For, Show, createSignal } from "solid-js";
import { Collapsible } from "@kobalte/core";
import { useMonitor } from "~/lib/connection/monitor";
import { ConfigurationTab } from "~/components/tauri/configuration-tab";
import { buildSchemaMap } from "~/lib/json-scheme-parser";

function formatBooleanProp(prop?: boolean) {
  return prop ? "✅" : "❌";
}

export default function TauriConfig() {
  const { monitorData } = useMonitor();
  console.log(monitorData.tauriConfig);

  const [descriptions] = buildSchemaMap(
    monitorData.schema!,
    monitorData.tauriConfig!
  );

  // build config array we can iterate over and remove empty entries
  const nav = Object.entries(monitorData.tauriConfig!).filter(
    ([_, entries]) =>
      typeof entries === "object" && Object.keys(entries).length > 0
  );

  const [currentNavElement, setCurrentNavElement] = createSignal(
    nav.length > 0 ? nav[0] : undefined
  );

  return (
    <div class="flex min-h-[-webkit-fill-available]">
      <aside class="w-50 border-neutral-800 border-r-2 p-2">
        <h2 class="text-neutral-300 pt-4 text-2xl">Tauri Config</h2>
        <nav class="flex flex-col gap-2 pl-4">
          <For each={nav}>
            {([key, navItem]) => (
              <a
                class="text-neutral-400 hover:text-white"
                href={`#${key}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentNavElement([key, navItem]);
                }}
              >
                {key}
              </a>
            )}
          </For>
        </nav>
        <h2 class="text-neutral-300 p-2 pt-4 text-2xl">JSON Source</h2>
      </aside>
      <section class="p-4">
        <Show when={currentNavElement()}>
          <ConfigurationTab
            tab={currentNavElement()}
            descriptions={descriptions}
          />
        </Show>
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
  );
}
