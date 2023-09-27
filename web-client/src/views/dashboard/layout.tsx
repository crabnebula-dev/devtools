import { createEffect } from "solid-js";
import { Outlet, useNavigate, useParams } from "@solidjs/router";
import { Button } from "@kobalte/core";
import { TransportContext, connect } from "~/lib/transport.tsx";
import { Navigation } from "~/components/navigation";

export default function Layout() {
  const { wsPort, wsUrl } = useParams();
  const navigate = useNavigate();

  const ctx = connect(`http://${wsUrl}:${wsPort}`);

  createEffect(() => {
    navigate(`/dash/${wsUrl}/${wsPort}/tauri`);
  })

  return (
      <TransportContext.Provider value={ctx}>
         <Button.Root
            type="button"
            id="close"
            class="fixed top-1 right-1 py-1 px-3 mx-1 text-sm border-2 font-bold border-red-500 hover:bg-red-500 hover:text-black focus:bg-red-500 focus:text-black"
            onClick={() => {
              ctx.abort.abort();
              navigate(`/`)
            }}
          >
            Close Connection
          </Button.Root>
          <Navigation />
          <Outlet />
      </TransportContext.Provider>
  );
}
