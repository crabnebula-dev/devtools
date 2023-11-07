import { createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
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

export default function Layout() {
  const { abortController, client } = useRouteData<Connection>();

  const [monitorData, setMonitorData] = createStore(initialMonitorData);
  const [tauriMetrics] = getTauriMetrics(client.tauri);
  const [tauriConfig] = getTauriConfig(client.tauri);

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
              const id = new_metadata.id?.id!;
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
        <div class="border-b border-gray-800 flex px-2 py-1 items-center justify-between">
          <HealthStatus />
          <BootTime />
          <DisconnectButton closeSession={closeSession} />
        </div>
        <Navigation />
      </header>
      <main class="max-h-full overflow-auto">
        <Outlet />
      </main>
      <footer class="p-2 flex justify-center border-t border-gray-800 gap-2 items-center">
        Built by <Logo size={16} /> CrabNebula
      </footer>
      <div class="surf-container">
        <img class="bg-surface static" src="/bg.jpeg" alt="" />
      </div>
    </MonitorContext.Provider>
  );
}
