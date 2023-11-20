import {
  HealthCheckRequest,
  HealthCheckResponse_ServingStatus,
} from "~/lib/proto/health";
import { Show, createEffect, createSignal, on, onMount } from "solid-js";
import { Dialog } from "./dialog";
import { addStreamListneners, connect } from "~/lib/connection/transport";
import { produce } from "solid-js/store";
import { useConnection } from "~/context/connection-provider";
import { useMonitor } from "~/context/monitor-provider";

/**
 * Reconnect
 * terminate all connections
 * createResource => setup a new connection, push new data to monitor store. [retry for 5s]
 * return resource.
 */

const variant = (status: HealthCheckResponse_ServingStatus) => {
  return [
    // unknown
    {
      style: "inline-block mr-3 w-3 h-3 bg-gray-200 rounded-full",
      tooltip: "Disconected",
    },
    // serving
    {
      style: "inline-block mr-3 w-3 h-3 bg-green-500 rounded-full",
      tooltip: "Connected",
    },
    // not serving
    {
      style: "inline-block mr-3 w-3 h-3 bg-red-500 rounded-full",
      tooltip: "Disconected",
    },
  ][status];
};

export function HealthStatus() {
  const { connectionStore, setConnection } = useConnection();
  const { monitorData, setMonitorData } = useMonitor();
  const [isConnectionDead, setConnectionDead] = createSignal(false);

  onMount(() => {
    connectionStore.stream.health.responses.onError(() => {
      console.error("an error happened on Health Stream");
      setMonitorData("health", 0);
      setConnectionDead(true);

      /** cleanup connections */
      connectionStore.abortController.abort();

      setTimeout(() => {
        const newConnection = connect(connectionStore.serviceUrl);
        console.log(newConnection);
        addStreamListneners(newConnection.stream.update, setMonitorData);
        setConnection(produce(() => newConnection));
      }, 10000);
    });

    connectionStore.stream.update.responses.onError(() => {
      console.error("an error happened on Updates Stream");
      // if (isConnectionDead()) {
      /**22
       * we do nothing because it's not an instrumentation issue.
       */
      return;
      // }
    });
  });

  createEffect(() => {
    if (monitorData.health === 1 && isConnectionDead()) {
      setConnectionDead(false);
    }
  });

  return (
    <section>
      <Show when={isConnectionDead()}>
        <Dialog title="Connection lost">Tauri app stopped streaming.</Dialog>
      </Show>
      <span class={variant(monitorData.health).style} />
      <span>{variant(monitorData.health).tooltip}</span>
    </section>
  );
}
