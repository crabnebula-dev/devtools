import {
  type JSXElement,
  createEffect,
  Show,
  createContext,
  useContext,
} from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import {
  getMetadata,
  getTauriConfig,
  getTauriMetrics,
  getVersions,
} from "~/lib/connection/getters";
import { MonitorData, initialMonitorData } from "~/lib/connection/monitor";
import { addStreamListneners } from "~/lib/connection/transport";
import { useConnection } from "~/context/connection-provider";
import { jsonSchemaForVersion } from "~/lib/tauri/config/json-schema-for-version";

type ProviderProps = {
  children: JSXElement;
};

const MonitorContext = createContext<{
  monitorData: MonitorData;
  setMonitorData: SetStoreFunction<MonitorData>;
}>();

export function useMonitor() {
  const ctx = useContext(MonitorContext);

  if (!ctx) throw new Error("can not find context");
  return ctx;
}

export function MonitorProvider(props: ProviderProps) {
  const { connectionStore } = useConnection();
  const [monitorData, setMonitorData] = createStore(initialMonitorData);
  const [tauriMetrics] = getTauriMetrics(connectionStore.client.tauri);
  const [tauriConfig] = getTauriConfig(connectionStore.client.tauri);
  const [tauriVersions] = getVersions(connectionStore.client.tauri);
  const [appMetadata] = getMetadata(connectionStore.client.meta);

  createEffect(() => {
    setMonitorData("tauriConfig", tauriConfig());
  });

  createEffect(() => {
    setMonitorData("appMetadata", appMetadata());
  });

  createEffect(() => {
    const versions = tauriVersions();
    if (versions) {
      const schema = jsonSchemaForVersion(versions.tauri);
      setMonitorData("schema", schema);
    }
    setMonitorData("tauriVersions", versions);
  });

  createEffect(() => {
    if (tauriMetrics()) {
      //  eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setMonitorData("perf", tauriMetrics()!);
    }
  });

  addStreamListneners(
    connectionStore.stream.update,
    setMonitorData,
    monitorData
  );

  return (
    <Show when={tauriMetrics()}>
      <MonitorContext.Provider value={{ monitorData, setMonitorData }}>
        {props.children}
      </MonitorContext.Provider>
    </Show>
  );
}
