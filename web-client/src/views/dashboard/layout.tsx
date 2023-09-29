import {createEffect, onCleanup} from "solid-js";
import {createStore} from "solid-js/store";
import {Outlet, useNavigate, useParams} from "@solidjs/router";
import {Navigation} from "~/components/navigation";
import {BootTime} from "~/components/boot-time";
import {HealthStatus} from "~/components/health-status.tsx"
import {initialState, StateContext} from "~/lib/state";
import {connect} from "~/lib/transport";
import {InstrumentClient} from '../../../generated/instrument.client'
import {InstrumentRequest} from "../../../generated/instrument";
import {TauriClient} from "../../../generated/tauri.client";
import {HealthClient} from "../../../generated/health.client.ts";
import {HealthCheckRequest, HealthCheckResponse, HealthCheckResponse_ServingStatus} from "../../../generated/health.ts";

export default function Layout() {
  const { wsPort, wsUrl } = useParams();
  const { transport, abort } = connect(`http://${wsUrl}:${wsPort}`);
  const [state, setState] = createStore(initialState);
  const navigate = useNavigate();

  createEffect(() => {
    const instrumentClient = new InstrumentClient(transport);
    const tauriClient = new TauriClient(transport);
    const healthClient = new HealthClient(transport);

    tauriClient.getConfig({}).then(resp => setState('tauriConfig', JSON.parse(resp.response.raw)));
    tauriClient.getMetrics({}).then(resp => setState('perf', resp.response));

    // This function acts as the callback for all streams
    // if one of the streams produces an error or completes (which is also not expected)
    // we are going to close the session
    function closeSession(err?: Error) {
      if (state.health) {
        console.log('closing session')
        setState('health', HealthCheckResponse_ServingStatus.UNKNOWN);
        if (err) {
          console.error("Closing instrument session because of error", err);
        }
        navigate('/')
      }
    }

    function updateHealth(res: HealthCheckResponse) {
      if (res.status == HealthCheckResponse_ServingStatus.NOT_SERVING) {
        console.error("Instrumentation server is in trouble")
      }
      setState('health', res.status)
    }

    // fetch the initial system health
    healthClient.check(HealthCheckRequest.create({ service: '' })).response.then(updateHealth)

    // and subscribe to monitor health continuously
    const healthStream = healthClient.watch(HealthCheckRequest.create({ service: '' }));
    healthStream.responses.onError(closeSession);
    healthStream.responses.onComplete(closeSession);
    healthStream.responses.onMessage(updateHealth);

    const updateStream = instrumentClient.watchUpdates(InstrumentRequest.create({}));
    updateStream.responses.onError(closeSession);
    updateStream.responses.onComplete(closeSession);
    updateStream.responses.onMessage((update) => {
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
    });
  })

  onCleanup(() => {
    abort.abort();
  })

  return (
    <main class="grid grid-rows-[auto,auto,1fr,auto] h-full">
      <StateContext.Provider value={{ state }}>
        <header class="flex gap-2 px-2">
          <HealthStatus />
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
