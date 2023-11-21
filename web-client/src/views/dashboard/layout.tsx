import { createEffect, onCleanup } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Outlet, useRouteData } from "@solidjs/router";
import { Navigation } from "~/components/navigation";
import { BootTime } from "~/components/boot-time";
import { HealthStatus } from "~/components/health-status.tsx";
import { initialMonitorData, MonitorContext } from "~/lib/connection/monitor";
import { InstrumentRequest } from "~/lib/proto/instrument";
import {
  getHealthStatus,
  getTauriConfig,
  getTauriMetrics,
  getVersions,
  getMetadata,
} from "~/lib/connection/getters";
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
} from "~/lib/proto/health";
import { Connection, disconnect } from "~/lib/connection/transport";
import { Logo } from "~/components/crabnebula-logo";
import { useNavigate } from "@solidjs/router";
import { DisconnectButton } from "~/components/disconnect-button";
import { updatedSpans } from "~/lib/span/update-spans";
import { updateSpanMetadata } from "~/lib/span/update-span-metadata";
import { returnLatestSchemaForVersion } from "~/lib/tauri/tauri-conf-schema";

export default function Layout() {
  const { abortController, client } = useRouteData<Connection>();

  const [monitorData, setMonitorData] = createStore(initialMonitorData);
  const [tauriMetrics] = getTauriMetrics(client.tauri);
  const [tauriConfig] = getTauriConfig(client.tauri);
  const [tauriVersions] = getVersions(client.tauri);
  const [appMetaData] = getMetadata(client.meta);

  const healthStream = client.health.watch(
    HealthCheckRequest.create({ service: "" })
  );

  const navigate = useNavigate();

  function closeSession() {
    // Clean up all the listeners to make sure we don't try to close the session multiple times.
    removeListeners.forEach((removeListener) => removeListener());

    setMonitorData("health", HealthCheckResponse_ServingStatus.UNKNOWN);
    disconnect(abortController);
    navigate("/");
  }

  healthStream.responses.onMessage((res: HealthCheckResponse) => {
    const status = getHealthStatus(res);

    setMonitorData("health", status);
  });

  createEffect(() => {
    setMonitorData("tauriConfig", tauriConfig());
  });

  createEffect(() => {
    const versions = tauriVersions();
    if (versions) {
      const schema = returnLatestSchemaForVersion(versions.tauri);
      setMonitorData("schema", schema);
    }
    setMonitorData("tauriVersions", versions);
  });

  createEffect(() => {
    setMonitorData("appMetaData", appMetaData());
  });

  createEffect(() => {
    if (tauriMetrics()) {
      //  eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setMonitorData("perf", tauriMetrics()!);
    }
  });

  const updateStream = client.instrument.watchUpdates(
    InstrumentRequest.create({})
  );

  const removeListeners = [
    healthStream.responses.onError(() => {
      closeSession();
    }),
    healthStream.responses.onComplete(() => {
      closeSession();
    }),
    updateStream.responses.onError(() => {
      closeSession();
    }),
    updateStream.responses.onComplete(() => {
      closeSession();
    }),
  ];

  updateStream.responses.onMessage((update) => {
    if (update.newMetadata.length > 0) {
      setMonitorData("metadata", (prev) => updateSpanMetadata(prev, update));
    }

    if (update.logsUpdate && update.spansUpdate) {
      console.assert(
        update.logsUpdate.droppedEvents == 0n,
        "Dropped log events because the internal event buffer was at capacity. This is a bug, please report!"
      );
      console.assert(
        update.spansUpdate.droppedEvents == 0n,
        "Dropped span events because the internal event buffer was at capacity. This is a bug, please report!"
      );
    }

    const logsUpdate = update.logsUpdate;
    if (logsUpdate && logsUpdate.logEvents.length > 0) {
      setMonitorData("logs", (prev) => [...prev, ...logsUpdate.logEvents]);
    }

    const spansUpdate = update.spansUpdate;
    if (spansUpdate && spansUpdate.spanEvents.length > 0) {
      setMonitorData(
        "spans",
        produce((clonedSpans) =>
          updatedSpans(clonedSpans, spansUpdate.spanEvents)
        )
      );
    }
  });

  onCleanup(() => {
    abortController.abort();
  });

  return (
    <MonitorContext.Provider value={{ monitorData }}>
      <header class="grid">
        <div class="border-b border-gray-800 flex px-2 py-1 items-center justify-between">
          <HealthStatus />
          <BootTime />
          <DisconnectButton closeSession={closeSession} />
        </div>
        <Navigation />
      </header>
      <main class="max-h-full w-full overflow-auto">
        <Outlet />
      </main>
      <footer class="p-2 flex justify-center border-t border-gray-800 gap-2 items-center">
        Built by <Logo size={16} /> CrabNebula
      </footer>
      <div class="overflow-hidden absolute inset-0 w-full h-full -z-10">
        <img
          class="relative opacity-30 scale-110 bg-surface bg-surface"
          src="/bg.jpeg"
          alt=""
        />
      </div>
    </MonitorContext.Provider>
  );
}
