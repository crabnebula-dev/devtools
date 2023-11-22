import { HealthCheckResponse_ServingStatus } from "~/lib/proto/health";
import { Show, createEffect, createSignal, onMount } from "solid-js";
import { ErrorDialog } from "./error-dialog";
import { addStreamListneners, connect } from "~/lib/connection/transport";
import { reconcile } from "solid-js/store";
import { useConnection } from "~/context/connection-provider";
import { useMonitor } from "~/context/monitor-provider";

const variant = (status: HealthCheckResponse_ServingStatus) => {
  return [
    // unknown
    {
      style: "inline-block mr-3 w-3 h-3 bg-gray-200 rounded-full",
      tooltip: "Disconnected",
    },
    // serving
    {
      style: "inline-block mr-3 w-3 h-3 bg-green-500 rounded-full",
      tooltip: "Connected",
    },
    // not serving
    {
      style: "inline-block mr-3 w-3 h-3 bg-red-500 rounded-full",
      tooltip: "Disconnected",
    },
  ][status];
};

export function HealthStatus() {
  const updateErrorHandler = () => {
    console.error("an error happened on Updates Stream");
    // if (isConnectionDead()) {
    /**
     * we do nothing because it's not an instrumentation issue.
     */
    return;
    // }
  };

  const healthErrorHandler = () => {
    console.error("an error happened on Health Stream");
    setMonitorData("health", 0);
    setConnectionDead(true);

    /** cleanup possible connections */
    connectionStore.abortController.abort();
    reconnect();
  };

  function reconnect() {
    const newConnection = connect(connectionStore.serviceUrl);
    setConnection(reconcile(newConnection, { merge: false }));

    addStreamListneners(connectionStore.stream.update, setMonitorData);
    connectionStore.stream.health.responses.onError(healthErrorHandler);
    connectionStore.stream.update.responses.onError(updateErrorHandler);
  }

  const { connectionStore, setConnection } = useConnection();
  const { monitorData, setMonitorData } = useMonitor();
  const [isConnectionDead, setConnectionDead] = createSignal(false);

  onMount(() => {
    connectionStore.stream.health.responses.onError(healthErrorHandler);
    connectionStore.stream.update.responses.onError(updateErrorHandler);
  });

  createEffect(() => {
    if (monitorData.health === 1 && isConnectionDead()) {
      setConnectionDead(false);
    }
  });

  return (
    <section>
      <Show when={isConnectionDead()}>
        <ErrorDialog title="Connection lost">
          <p class="text-xl">Streaming has stopped.</p>
          <p class="text-red-300 text-xl">
            Waiting on new signal from your Tauri app.
          </p>
        </ErrorDialog>
      </Show>
      <span class={variant(monitorData.health).style} />
      <span>{variant(monitorData.health).tooltip}</span>
    </section>
  );
}
