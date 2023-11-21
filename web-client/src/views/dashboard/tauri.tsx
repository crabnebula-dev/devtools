import { ConfigurationView } from "~/components/tauri/configuration-view";
import { Sidebar } from "~/components/tauri/sidebar";
import JsonView from "~/components/tauri/json-view.tsx";
import { ConfigurationContextProvider } from "~/components/tauri/configuration-context";
import { SplitPane } from "~/components/split-pane";

export default function TauriConfig() {
  return (
    <ConfigurationContextProvider>
      <SplitPane
        defaultPrefix="tauri-config"
        defaultMinSizes={[150, 300, 300]}
        initialSizes={[10, 45, 45]}
      >
        <Sidebar />
        <ConfigurationView />
        <JsonView />
      </SplitPane>
    </ConfigurationContextProvider>
  );
}
