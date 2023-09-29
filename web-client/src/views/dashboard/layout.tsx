import { createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { Outlet } from "@solidjs/router";
import { Navigation } from "~/components/navigation";
import { BootTime } from "~/components/boot-time";
import { HealthStatus } from "~/components/health-status.tsx";
import { initialMonitorData, MonitorContext } from "~/lib/connection/monitor";
import { InstrumentRequest } from "~/lib/proto/instrument";
import {
  getHealthStatus,
  getTauriConfig,
  getTauriMetrics,
} from "~/lib/connection/getters";
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
} from "~/lib/proto/health";
import { Connection, disconnect } from "~/lib/connection/transport";

export default function Layout() {
  const { abortController, client } = useRouteData<Connection>();

  const [monitorData, setMonitorData] = createStore(initialMonitorData);
  const [tauriMetrics] = getTauriMetrics(client.tauri);
  const [tauriConfig] = getTauriConfig(client.tauri);

  const healthStream = client.health.watch(
    HealthCheckRequest.create({ service: "" })
  );

  function closeSession() {
    setMonitorData("health", HealthCheckResponse_ServingStatus.UNKNOWN);
    disconnect(abortController, "/");
  }

  healthStream.responses.onMessage((res: HealthCheckResponse) => {
    const status = getHealthStatus(res);

    setMonitorData("health", status);
  });

  createEffect(() => {
    setMonitorData("tauriConfig", tauriConfig());
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

  healthStream.responses.onError(() => {
    closeSession();
  });
  healthStream.responses.onComplete(() => {
    closeSession();
  });
  updateStream.responses.onError(() => {
    closeSession();
  });
  updateStream.responses.onComplete(() => {
    closeSession();
  });

  updateStream.responses.onMessage((update) => {
    if (update.newMetadata.length > 0) {
      setMonitorData(
        "metadata",
        (prev) =>
          new Map([
            ...(prev || []),
            ...update.newMetadata.map((new_metadata) => {
              /**
               * protobuf generated types have these as optional.
               */
              //  eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const id = new_metadata.id!;
              //  eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const metadata = new_metadata.metadata!;

              return [id, metadata] as const;
            }),
          ])
      );
    }

    const logsUpdate = update.logsUpdate;
    if (logsUpdate && logsUpdate.logEvents.length > 0) {
      setMonitorData("logs", (prev) => [...prev, ...logsUpdate.logEvents]);
    }

    const spansUpdate = update.spansUpdate;
    if (spansUpdate && spansUpdate.spanEvents.length > 0) {
      setMonitorData("spans", (prev) => [...prev, ...spansUpdate.spanEvents]);
    }
  });

  onCleanup(() => {
    abortController.abort();
  });

  return (
    <MonitorContext.Provider value={{ monitorData }}>
      <header class="grid">
        <div class="flex px-2 py-1 items-center justify-between">
          <HealthStatus />
          <BootTime />
        </div>
        <Navigation />
      </header>
      <main class="max-h-full overflow-auto">
        <Outlet />
      </main>
      <footer class="p-2">Built by CrabNebula</footer>
    </MonitorContext.Provider>
  );
}
