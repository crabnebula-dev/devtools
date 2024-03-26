import {
  type JSXElement,
  createEffect,
  Show,
  createContext,
  useContext,
  createResource,
} from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import {
  getMetadata,
  getTauriConfig,
  getTauriMetrics,
  getVersions,
} from "~/lib/connection/getters";
import { MonitorData, initialMonitorData } from "~/lib/connection/monitor";
import { addStreamListeners } from "~/lib/connection/transport";
import { useConnection } from "~/context/connection-provider";
import { jsonSchemaForVersion } from "~/lib/tauri/config/json-schema-for-version";
import { initialDurations } from "~/lib/connection/monitor";
import { loadConfigurations } from "~/lib/tauri/config/retrieve-configurations";

type ProviderProps = {
  children: JSXElement;
};

const MonitorContext = createContext<{
  monitorData: MonitorData;
  setMonitorData: SetStoreFunction<MonitorData>;
  resetCalls: () => void;
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
  const [appMetadata] = getMetadata(connectionStore.client.meta);
  const [tauriConfig] = getTauriConfig(connectionStore.client.tauri);
  const [tauriVersions] = getVersions(connectionStore.client.tauri);
  const [tauriConfigStore] = createResource(
    /** The base configuration and the active tauri version have to be loaded for proper parsing */
    () =>
      tauriConfig() && tauriVersions()
        ? [tauriConfig(), tauriVersions()]
        : undefined,
    ([tauriConfig, tauriVersions]) => {
      return loadConfigurations(tauriConfig, tauriVersions);
    },
  );

  createEffect(() => {
    setMonitorData("tauriConfig", tauriConfig());
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
    const configs = tauriConfigStore();
    setMonitorData("tauriConfigStore", { configs });
  });

  createEffect(() => {
    setMonitorData("appMetadata", appMetadata());
  });

  createEffect(() => {
    const metrics = tauriMetrics();
    if (metrics) {
      setMonitorData("perf", metrics);
    }
  });

  addStreamListeners(
    connectionStore.stream.update,
    setMonitorData,
    monitorData,
  );

  const resetCalls = () => {
    setMonitorData("durations", initialDurations());

    monitorData.spans.clear();
  };

  return (
    <Show when={tauriMetrics()}>
      <MonitorContext.Provider
        value={{ monitorData, setMonitorData, resetCalls }}
      >
        {props.children}
      </MonitorContext.Provider>
    </Show>
  );
}
