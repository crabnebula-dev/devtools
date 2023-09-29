import type { WSEventSignal } from "~/lib/ws/types";
import { Show, createEffect, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Outlet, useLocation, useNavigate, useParams } from "@solidjs/router";
import { Navigation } from "~/components/navigation";
import { createEventSignal } from "@solid-primitives/event-listener";
import { BootTime } from "~/components/boot-time";
import { useSubscriber } from "~/lib/ws/queries";
import { SOCKET_STATES, connectWS } from "~/lib/ws/connection";
import { initialStoreData } from "~/lib/ws/store";
import { DataContext, WSContext } from "~/lib/ws/context";
import { ConnectionStatus } from "~/components/connection-status";

export default function Layout() {
  const [appData, setData] = createStore(initialStoreData);

  const { wsPort, wsUrl } = useParams();
  const navigate = useNavigate();
  const { socket, state: status } = connectWS(`ws://${wsUrl}:${wsPort}`);
  const subscriber = useSubscriber(socket);
  const { pathname } = useLocation();
  const message = createEventSignal<WSEventSignal>(socket, "message");

  onMount(() => {
    subscriber("logs_watch");
    subscriber("tauri_getConfig");
    subscriber("metrics");
    subscriber("spans_watch");
  });

  createEffect(() => {
    if (message()) {
      const data = JSON.parse(message().data);

      /**
       * @FIXME
       * this is a bad way to check each event 🍝
       */

      if (data.id === "metrics") {
        setData("perf", data.result);
      }

      if (data.result?.build) {
        setData("tauriConfig", data.result);
      }

      if (data.id === "logs_watch" || data.method === "logs_added") {
        setData("logs", (prevList) => {
          if (data?.params?.result) {
            return [...prevList, ...data.params.result];
          } else {
            return prevList;
          }
        });
      }

      if (data.id === "spans_watch" || data.method === "spans_added") {
        /**
         * @TODO split spans according to level (INFO or DEBUG)
         */
        setData("spans", (prevList) => {
          if (data?.params?.result) {
            return [...prevList, ...data.params.result];
          } else {
            return prevList;
          }
        });
      }
    }
  });

  createEffect(() => {
    if (status() === SOCKET_STATES.get(WebSocket.OPEN)) {
      if (pathname.includes("/dash/")) {
        return;
      } else {
        navigate(`/dash/${wsUrl}/${wsPort}/console`);
      }
    } else if (
      status() === SOCKET_STATES.get(WebSocket.CLOSING || WebSocket.CLOSED)
    ) {
      navigate(`/`);
    }
  });

  return (
    <WSContext.Provider value={{ socket, state: status }}>
      <DataContext.Provider value={{ data: appData }}>
        <Show when={status() === SOCKET_STATES.get(WebSocket.OPEN)}>
          <header class="grid">
            <div class="flex px-2 py-1 items-center justify-between">
              <ConnectionStatus socket={socket} status={status} />
              <BootTime />
            </div>
            <Navigation />
          </header>
          <main class="max-h-full overflow-auto">
            <Outlet />
          </main>
          <footer class="p-2">Built by CrabNebula</footer>
        </Show>
      </DataContext.Provider>
    </WSContext.Provider>
  );
}
