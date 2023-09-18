import { createEventSignal } from "@solid-primitives/event-listener";
import { For, createEffect, createSignal, onCleanup } from "solid-js";
import { useWs } from "../../lib/ws";
import { LOGS_UNWATCH, LOGS_WATCH } from "../../lib/requests";

type WSEventSignal = Record<"message", MessageEvent<string>>;

type LogResult = {
  timestamp: number;
  message: string;
  target: string;
  level: "TRACE" | string;
  module_path: string;
  file: string;
  line: number;
};

type Log = {
  id: string;
  jsonrpc: "2.0";
  method: "logs_added";
  params: {
    subscription: string;
    result?: LogResult;
  };
};

function formatTimestamp(stamp: Date) {
  return `${stamp.getHours()}:${stamp.getMinutes()}:${stamp.getSeconds()}`;
}

export default function Console() {
  const { socket } = useWs();
  const message = createEventSignal<WSEventSignal>(socket, "message");
  const [logs, setLogs] = createSignal<LogResult[]>([]);
  const [currentSubscription, setCurrentSubscription] = createSignal();

  const logData = (): Log | undefined => {
    if (message()) {
      return JSON.parse(message().data);
    }
  };

  createEffect(() => {
    const log = logData()?.params?.result || null;
    if (log !== null) {
      setCurrentSubscription(log);
      setLogs((prev) => [log, ...prev]);
    }
  });

  createEffect(() => {
    socket.send(JSON.stringify(LOGS_WATCH));
  });

  onCleanup(() => {
    socket.send(JSON.stringify(LOGS_UNWATCH(currentSubscription)));
  });

  return (
    <>
      <ul>
        <For each={logs()}>
          {({ message, timestamp }) => {
            const timeDate = new Date(timestamp);
            return (
              <li class="py-1">
                <time dateTime={timeDate.toISOString()} class="font-mono pr-4">
                  {formatTimestamp(timeDate)}
                </time>
                <span>{message}</span>
              </li>
            );
          }}
        </For>
      </ul>
    </>
  );
}
