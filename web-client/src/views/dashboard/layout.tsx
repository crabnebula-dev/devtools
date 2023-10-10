import { createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { Outlet, useNavigate, useParams } from "@solidjs/router";
import { Navigation } from "~/components/navigation";
import { BootTime } from "~/components/boot-time";
import { HealthStatus } from "~/components/health-status.tsx";
import { initialMonitorData, MonitorContext } from "~/lib/connection/monitor";
import { connect } from "~/lib/connection/transport";
import { InstrumentRequest } from "~/lib/proto/instrument";
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
} from "~/lib/proto/health.ts";
import { getTauriConfig, getTauriMetrics } from "~/lib/connection/getters";
import { MetaId, Metadata } from "~/lib/proto/common";

export default function Layout() {
  const { host, port } = useParams();
  const navigate = useNavigate();
  const { abortController, client } = connect(`http://${host}:${port}`);
  const [monitorData, setMonitorData] = createStore(initialMonitorData);
  const [tauriMetrics] = getTauriMetrics(client.tauri);
  const [tauriConfig] = getTauriConfig(client.tauri);

  createEffect(() => {
    setMonitorData("tauriConfig", tauriConfig() as object);
  });

  createEffect(() => {
    const metric = tauriMetrics();
    if (metric) {
      setMonitorData("perf", metric);
    }
  });

  function closeSession(err?: Error) {
    if (monitorData.health) {
      console.log("closing session");
      setMonitorData("health", HealthCheckResponse_ServingStatus.UNKNOWN);
      if (err) {
        console.error("Closing instrument session because of error", err);
      }
      navigate("/");
    }
  }

  function updateHealth(res: HealthCheckResponse) {
    if (res.status == HealthCheckResponse_ServingStatus.NOT_SERVING) {
      console.error("Instrumentation server is in trouble");
    }
    setMonitorData("health", res.status);
  }

  createEffect(() => {
    // fetch the initial system health
    client.health
      .check(HealthCheckRequest.create({ service: "" }))
      .response.then(updateHealth);

    // and subscribe to monitor health continuously
    const healthStream = client.health.watch(
      HealthCheckRequest.create({ service: "" })
    );
    healthStream.responses.onError(closeSession);
    healthStream.responses.onComplete(closeSession);
    healthStream.responses.onMessage(updateHealth);

    healthStream.responses.onComplete;

    const updateStream = client.instrument.watchUpdates(
      InstrumentRequest.create({})
    );
    updateStream.responses.onError(closeSession);
    updateStream.responses.onComplete(closeSession);

    updateStream.responses.onMessage((update) => {
      if (update.newMetadata.length > 0) {
        setMonitorData(
          "metadata",
          (prev) =>
            new Map([
              ...(prev || []),
              ...update.newMetadata.map((new_metadata) => {
                /**
                 * @TODO
                 * protobuf generated types have these as optional.
                 */
                const id = new_metadata.id as MetaId;
                const metadata = new_metadata.metadata as Metadata;

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
  });

  onCleanup(() => {
    /**
     * @FIXME
     * this is not closing connections,
     * just aborting latest request.
     */

    abortController.abort();
  });

  return (
    <main class="grid grid-rows-[auto,auto,1fr,auto] h-full">
      <MonitorContext.Provider value={{ monitorData }}>
        <header class="flex gap-2 px-2">
          <HealthStatus />
          <BootTime />
          <Navigation />
        </header>
        <article class="bg-gray-900 pt-10 h-full">
          <Outlet />
        </article>
      </MonitorContext.Provider>
      <footer>Built by CrabNebula</footer>
    </main>
  );
}
