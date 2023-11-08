import {
  Show,
  createSignal,
  createContext,
  useContext,
  onMount,
} from "solid-js";
import { useMonitor } from "~/lib/connection/monitor";
import { ConfigurationView } from "~/components/tauri/configuration-view";
import { buildSchemaMap } from "~/lib/json-schema-parser";
import { Sidebar } from "~/components/tauri/sidebar";
import JsonView from "~/components/tauri/json-view.tsx";
import { HighlightKeyProvider } from "~/components/tauri/highlight-key";
import Split from "split.js";
import "~/components/tauri/gutter-style.css";

const DescriptionsContext = createContext<Map<string, any>>();

export function useDescriptions() {
  const ctx = useContext(DescriptionsContext);
  if (!ctx) throw new Error("Could not load descriptions for config");
  return ctx;
}

export default function TauriConfig() {
  const { monitorData } = useMonitor();

  const descriptions = buildSchemaMap(
    monitorData.schema ?? {},
    monitorData.tauriConfig!
  );

  // build config array we can iterate over and remove empty entries
  const nav = Object.entries(monitorData.tauriConfig!).filter(
    ([_, entries]) => typeof entries === "object"
  );

  const [currentView, setCurrentView] = createSignal(
    nav.length > 0 ? nav[0] : undefined
  );

  const splitGutterSizesKey = "tauri-config-split-sizes";
  const storedSizes = localStorage.getItem(splitGutterSizesKey);
  let sizes = [10, 45, 45];

  if (storedSizes) {
    sizes = JSON.parse(storedSizes);
  }

  onMount(() => {
    Split(["#side", "#config", "#json"], {
      sizes: sizes,
      minSize: [100, 300, 300],
      onDragEnd: function (sizes) {
        localStorage.setItem(splitGutterSizesKey, JSON.stringify(sizes));
      },
    });
  });

  return (
    <DescriptionsContext.Provider value={descriptions}>
      <HighlightKeyProvider>
        <div class="flex h-full tauri-config ">
          <aside id="side" class="border-neutral-800 border-r-2">
            <Sidebar nav={nav} setCurrentNavElement={setCurrentView} />
          </aside>
          <section
            id="config"
            class="border-neutral-800 border-x-2 p-4 overflow-auto"
          >
            <Show when={currentView()}>
              <ConfigurationView tab={currentView()} />
            </Show>
          </section>
          <section
            id="json"
            class="border-neutral-800 border-x-2 overflow-auto"
          >
            <JsonView path="tauri.conf.json" size={1216} lang="json" />
          </section>
        </div>
      </HighlightKeyProvider>
    </DescriptionsContext.Provider>
  );
}
