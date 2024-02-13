import { HealthCheckResponse_ServingStatus } from "~/lib/proto/health";
import { Show, createEffect, createSignal, onMount } from "solid-js";
import { ErrorDialog } from "./dialogs/error-dialog";
import {
  addStreamListneners,
  connect,
  checkConnection,
} from "~/lib/connection/transport";
import { reconcile } from "solid-js/store";
import { useConnection } from "~/context/connection-provider";
import { useMonitor } from "~/context/monitor-provider";
import { ReconnectDisplay } from "./reconnect-display";
import { ReconnectButton } from "./reconnect-button";

const variant = (status: HealthCheckResponse_ServingStatus) => {
  return [
    // unknown
    {
      style: "inline-block mr-3 w-3 h-3 bg-gray-200 rounded-full",
      tooltip: "disconnected",
    },
    // serving
    {
      style: "inline-block mr-3 w-3 h-3 bg-green-500 rounded-full",
      tooltip: "connected",
    },
    // not serving
    {
      style: "inline-block mr-3 w-3 h-3 bg-red-500 rounded-full",
      tooltip: "disconnected",
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

    if (reconnectTimer() === undefined)
      reconnectInterval({
        timeIncrease: 2,
        attempts: 5,
      });
  };

  /*  undefined = failed to reconnect 
      -1 = reconnecting
      > 0 = time until reconnect 
  */
  const [reconnectTimer, setReconnectTimer] = createSignal<number | undefined>(
    undefined,
  );

  async function reconnectInterval(
    steps: { timeIncrease: number; attempts: number },
    initialTime = 1,
  ) {
    setReconnectTimer(-1);
    const ping = await checkConnection(connectionStore.serviceUrl);

    // If the ping returns an error we queue the next reconnect
    if (ping.status === "error") {
      if (steps.attempts > 0) {
        setReconnectTimer(initialTime);

        const interval = setInterval(() => {
          const currentTimer = reconnectTimer();
          const timer = typeof currentTimer === "number" ? currentTimer - 1 : 0;
          setReconnectTimer(timer);
        }, 1000);

        setTimeout(
          async () => {
            await reconnectInterval(
              {
                timeIncrease: steps.timeIncrease,
                attempts: steps.attempts - 1,
              },
              initialTime + steps.timeIncrease,
            );
            clearInterval(interval);
          },
          (initialTime + 1) * 1000,
        );

        return;
      }

      setReconnectTimer(undefined);
      return;
    }

    // If the ping does not return an error we assume it is safe to reconnect
    setReconnectTimer(undefined);
    reconnect();
  }

  async function attemptReconnect() {
    setConnectionDead(false);
    setConnectionDead(true);
    const ping = await checkConnection(connectionStore.serviceUrl);
    if (ping.status === "success") reconnect();
  }

  function reconnect() {
    setMonitorData("spans", reconcile([]));
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
          <ReconnectDisplay timer={reconnectTimer()} />
        </ErrorDialog>
      </Show>
      <span class={variant(monitorData.health).style} />
      <span>{variant(monitorData.health).tooltip}</span>
      <Show when={monitorData.health === 0}>
        <ReconnectButton retry={attemptReconnect} />
      </Show>
    </section>
  );
}
