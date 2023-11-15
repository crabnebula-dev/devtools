import { Show, createSignal, onMount } from "solid-js";
import { ConfigurationView } from "~/components/tauri/configuration-view";
import { Sidebar } from "~/components/tauri/sidebar";
import JsonView from "~/components/tauri/json-view.tsx";
import { ConfigurationContextProvider } from "~/components/tauri/configuration-context";
import Split from "split.js";
import "~/components/tauri/gutter-style.css";
import { useSearchParams } from "@solidjs/router";

export default function TauriConfig() {
  const [searchParams] = useSearchParams();
  const jsonPath = () => searchParams.path;
  const size = () => Number(searchParams.size);

  const [currentView, setCurrentView] = createSignal<{
    name: string;
    data: Record<string, object>;
  }>();

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
    <ConfigurationContextProvider>
      <div class="flex h-full tauri-config ">
        <aside id="side" class="border-neutral-800 border-r-2">
          <Sidebar setCurrentNavElement={setCurrentView} />
        </aside>
        <section
          id="config"
          class="border-neutral-800 border-x-2 p-4 overflow-auto"
        >
          <Show when={currentView()}>
            <ConfigurationView tab={currentView()!} />
          </Show>
        </section>
        <section id="json" class="border-neutral-800 border-x-2 overflow-auto">
          <Show when={jsonPath()}>
            <JsonView path={jsonPath()} size={size()} lang="json" />
          </Show>
        </section>
      </div>
    </ConfigurationContextProvider>
  );
}
