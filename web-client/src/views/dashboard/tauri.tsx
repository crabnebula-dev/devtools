import { Show, createSignal } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { ConfigurationView } from "~/components/tauri/configuration-view";
import { Sidebar } from "~/components/tauri/sidebar";
import JsonView from "~/components/tauri/json-view.tsx";
import { ConfigurationContextProvider } from "~/components/tauri/configuration-context";
import { SplitPane } from "~/components/split-pane";

export default function TauriConfig() {
  const [searchParams] = useSearchParams();
  const jsonPath = () => searchParams.path;
  const size = () => Number(searchParams.size);

  const [currentView, setCurrentView] = createSignal<{
    name: string;
    data: Record<string, object>;
  }>();

  return (
    <ConfigurationContextProvider>
      <SplitPane
        defaultPrefix="tauri-config"
        defaultMinSizes={[150, 300, 300]}
        initialSizes={[10, 45, 45]}
      >
        <Sidebar setCurrentNavElement={setCurrentView} />
        <div>
          <Show when={currentView()}>
            <ConfigurationView tab={currentView()!} />
          </Show>
        </div>
        <Show when={jsonPath()}>
          <JsonView path={jsonPath()} size={size()} lang="json" />
        </Show>
      </SplitPane>
    </ConfigurationContextProvider>
  );
}
