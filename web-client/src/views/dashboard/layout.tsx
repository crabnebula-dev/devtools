import { Show, createEffect } from "solid-js";
import { Outlet, useLocation, useNavigate, useParams } from "@solidjs/router";
import { Button } from "@kobalte/core";
import { SOCKET_STATES, WSContext, connectWS } from "~/lib/ws";
import { Navigation } from "~/components/navigation";

export default function Layout() {
  const { wsPort, wsUrl } = useParams();
  const navigate = useNavigate();
  const { socket, state: status } = connectWS(`ws://${wsUrl}:${wsPort}`);
  const { pathname } = useLocation();

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
          <Outlet />
        </WSContext.Provider>
      </Show>
    </>
  );
}
