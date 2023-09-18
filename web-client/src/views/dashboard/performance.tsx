import { createEffect } from "solid-js";
import { createEventSignal } from "@solid-primitives/event-listener";
import { useWs } from "~/lib/ws";
import { PERF_METRICS } from "~/lib/requests";

type WSEventSignal = Record<"message", MessageEvent<string>>;

type PerfLog = {
  id: "metrics";
  jsonrpc: "2.0";
  result: {
    initialized_at: number;
    ready_at: number;
  };
};

export default function Performance() {
  const { socket } = useWs();
  const message = createEventSignal<WSEventSignal>(socket, "message");

  const perfData = (): PerfLog | undefined => {
    if (message()) {
      const log = JSON.parse(message().data);

      if (log.id === PERF_METRICS.id) {
        return log;
      }
    }
  };

  createEffect(() => {
    socket.send(JSON.stringify(PERF_METRICS));
  });

  return <pre class="text-white">{JSON.stringify(perfData(), null, 2)}</pre>;
}
