import { Show } from "solid-js";
import { useSocketData } from "~/lib/ws/context";

export function BootTime() {
  const { data } = useSocketData();

  return (
    <Show when={data.perfElapsed} fallback={"Waiting for data..."}>
      {(e) => (
        <section>
          Loaded in <span class="font-bold">{e()}ms</span>
        </section>
      )}
    </Show>
  );
}
