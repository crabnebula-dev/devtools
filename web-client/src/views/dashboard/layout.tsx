import { Show, createEffect, onMount } from "solid-js";
import { Outlet, useLocation, useNavigate, useParams } from "@solidjs/router";
import { Button } from "@kobalte/core";
import { SOCKET_STATES, WSContext, connectWS } from "~/lib/ws";
import { Navigation } from "~/components/navigation";
import { createEventSignal } from "@solid-primitives/event-listener";
import { LOGS_WATCH, PERF_METRICS, TAURI_CONFIG } from "~/lib/requests";
import { createStore } from "solid-js/store";
import {
  initialStoreData,
  DataContext,
  type WSEventSignal,
} from "~/lib/ws-store";

export default function Layout() {
  const [wsData, setData] = createStore(initialStoreData);

  const { wsPort, wsUrl } = useParams();
  const navigate = useNavigate();
  const { socket, state: status } = connectWS(`ws://${wsUrl}:${wsPort}`);
  const { pathname } = useLocation();
  const message = createEventSignal<WSEventSignal>(socket, "message");

  onMount(() => {
    socket.send(JSON.stringify(TAURI_CONFIG));
    socket.send(JSON.stringify(PERF_METRICS));
    socket.send(JSON.stringify(LOGS_WATCH));
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
            return [...data.params.result, ...prevList];
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
        navigate(`/dash/${wsUrl}/${wsPort}/tauri`);
      }
    } else if (
      status() === SOCKET_STATES.get(WebSocket.CLOSING || WebSocket.CLOSED)
    ) {
      navigate(`/`);
    }
  });

  return (
    <>
      <Show
        when={
          status() === SOCKET_STATES.get(WebSocket.CONNECTING) ||
          status() === SOCKET_STATES.get(WebSocket.OPEN)
        }
      >
        <div id="status" class="inline-block text-sm py-1 my-4">
          WS Status: <span class="text-emerald-500">{status()}</span>
        </div>
      </Show>
      <Show when={status() === SOCKET_STATES.get(WebSocket.OPEN)}>
        <WSContext.Provider value={{ socket, state: status }}>
          <Button.Root
            type="button"
            id="close"
            class="fixed top-1 right-1 py-1 px-3 mx-1 text-sm border-2 font-bold border-red-500 hover:bg-red-500 hover:text-black focus:bg-red-500 focus:text-black"
            onClick={() => {
              socket.close();
            }}
          >
            Close Connection
          </Button.Root>
          <Navigation />
          <DataContext.Provider value={{ data: wsData }}>
            <Outlet />
          </DataContext.Provider>
        </WSContext.Provider>
      </Show>
    </>
  );
}
