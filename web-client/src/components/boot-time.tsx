import { Show } from "solid-js";
import { useMonitor } from "~/lib/connection/monitor";

export function BootTime() {
  const { monitorData } = useMonitor();

  return (
    <Show when={monitorData.perfElapsed} fallback={"waiting for data..."}>
      {(e) => (
        <section>
          <strong>Loading time:</strong>{" "}
          <span class="font-mono">
            {Number(e().seconds) * 1000 + e().nanos / 1e6}ms
          </span>
        </section>
      )}
    </Show>
  );
}
