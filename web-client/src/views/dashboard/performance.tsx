import { Show } from "solid-js";
import { useSocketData } from "~/lib/ws-store";

export default function Performance() {
  const { data } = useSocketData();

  return (
    <ul>
      <Show when={data.perfStartDate} fallback={"waiting for data..."}>
        {(date) => <li>Initialized: {date().toISOString()}</li>}
      </Show>

      <Show when={data.perfReadyDate} fallback={"waiting for data..."}>
        {(date) => <li>Ready: {date().toISOString()}</li>}
      </Show>

      <Show when={data.perfElapsed} fallback={"waiting for data..."}>
        {(e) => <li>Elapsed time: {e()} ms</li>}
      </Show>
    </ul>
  );
}
