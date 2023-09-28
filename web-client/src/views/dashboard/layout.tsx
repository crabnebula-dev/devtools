import { createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { Outlet, useParams } from "@solidjs/router";
import { Navigation } from "~/components/navigation";
import { BootTime } from "~/components/boot-time";
import { StateContext, initialState } from "~/lib/state";
import { connect } from "~/lib/transport";
import { InstrumentClient } from '../../../generated/instrument.client'
import { InstrumentRequest } from "../../../generated/instrument";
import { TauriClient } from "../../../generated/tauri.client";

export default function Layout() {
  const { wsPort, wsUrl } = useParams();
  const { transport, abort } = connect(`http://${wsUrl}:${wsPort}`);
  const [state, setState] = createStore(initialState);

  createEffect(() => {
    const instrumentClient = new InstrumentClient(transport);
    const tauriClient = new TauriClient(transport);
    const updateStream = instrumentClient.watchUpdates(InstrumentRequest.create({}));

    tauriClient.getConfig({}).then(resp => setState('tauriConfig', JSON.parse(resp.response.raw)));
    tauriClient.getMetrics({}).then(resp => setState('perf', resp.response));

    // effects can't be async?
    (async () => {
      for await (const update of updateStream.responses) {
        if (update.newMetadata.length > 0) {
          setState('metadata', (prev) => new Map([
            ...(prev || []),
            ...update.newMetadata.map(new_metadata => [new_metadata.id!, new_metadata.metadata!] as const)
          ])
          )
        }

        const logsUpdate = update.logsUpdate
        if (logsUpdate && logsUpdate.logEvents.length > 0) {
          setState('logs', (prev) => [...prev, ...logsUpdate.logEvents])
        }

        const spansUpdate = update.spansUpdate;
        if (spansUpdate && spansUpdate.spanEvents.length > 0) {
          setState('spans', (prev) => [...prev, ...spansUpdate.spanEvents])
        }
      }
    })()
  })

  onCleanup(() => {
    abort.abort();
  })

  return (
    <main class="grid grid-rows-[auto,auto,1fr,auto] h-full">
      <StateContext.Provider value={{ state }}>
        <header>
          <BootTime />
          <Navigation />
        </header>
        <article class="bg-gray-900 pt-10 h-full">
          <Outlet />
        </article>
      </StateContext.Provider>
      <footer>Built by CrabNebula</footer>
    </main>
  );
}
