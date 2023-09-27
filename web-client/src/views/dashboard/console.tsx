import { For, createEffect, createSignal, onCleanup } from "solid-js";
import {InstrumentClient} from "../../../generated/instrument.client.ts";
import {InstrumentRequest} from "../../../generated/instrument.ts";
import {LogEvent} from "../../../generated/logs.ts";
import {useTransport} from "~/lib/transport.tsx";

function formatTimestamp(stamp: Date) {
  return `${stamp.getHours()}:${stamp.getMinutes()}:${stamp.getSeconds()}`;
}

export default function Console() {
  const { transport } = useTransport();
  const [logs, setLogs] = createSignal<LogEvent[]>([]);

  let abort: AbortController;

  createEffect(() => {
    const client = new InstrumentClient(transport)

    abort = new AbortController();
    const updates = client.watchUpdates(InstrumentRequest.create({}), { abort: abort.signal });

    updates.responses.onError((err) => {
      console.error(err)
    })

    updates.responses.onMessage((update) => {
      setLogs((prev) => [...(update.logsUpdate?.logEvents || []), ...prev]);
    })
  });

  onCleanup(() => { abort.abort() })

  return (
    <>
      <ul>
        <For each={logs()}>
          {({ message, at }) => {
            const timeDate = new Date(Number(at!.seconds * 1000n) + (at!.nanos / 1e6));
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
