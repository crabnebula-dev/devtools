import { Show } from "solid-js";
import { useSocketData } from "~/lib/ws-store";

export function BootTime() {
  const { data } = useSocketData();

  return (
    <Show when={data.perfElapsed} fallback={"waiting for data..."}>
      {(e) => (
        <section>
          <strong>Loading time:</strong> <span class="font-mono">{e()}ms</span>
        </section>
      )}
    </Show>
  );
}
