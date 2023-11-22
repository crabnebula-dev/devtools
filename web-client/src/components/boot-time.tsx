import { Show } from "solid-js";
import { Loader } from "./loader";
import { useMonitor } from "~/context/monitor-provider";

export function BootTime() {
  const { monitorData } = useMonitor();
  return (
    <Show when={monitorData.perfElapsed} fallback={<Loader />}>
      {(e) => (
        <section>
          <strong>Loading time: </strong>
          <span class="font-mono">
            {(Number(e().seconds) * 1000 + e().nanos / 1e6).toFixed(2)}ms
          </span>
        </section>
      )}
    </Show>
  );
}
