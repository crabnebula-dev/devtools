import { Show } from "solid-js";
import { formatTimestamp } from "~/lib/formaters";
import { useSocketData } from "~/lib/ws-store";

export function PerformanceComponent() {
  const { data } = useSocketData();

  return (
    <section>
      <h2>Loading time:</h2>
      <ul>
        <Show when={data.perfStartDate} fallback={"waiting for data..."}>
          {(date) => <li>App initialized at: {formatTimestamp(date())}</li>}
        </Show>

        <Show when={data.perfReadyDate} fallback={"waiting for data..."}>
          {(date) => <li>Ready at: {formatTimestamp(date())}</li>}
        </Show>

        <Show when={data.perfElapsed} fallback={"waiting for data..."}>
          {(e) => <li>Boot time: {e()} ms</li>}
        </Show>
      </ul>
    </section>
  );
}

export default function BootTime() {
  const { data } = useSocketData();

  return (
    <Show when={data.perfElapsed} fallback={"waiting for data..."}>
      {(e) => (
        <section>
          <strong>Loading time:</strong> <span class="font-mono">{e()} ms</span>
        </section>
      )}
    </Show>
  );
}
