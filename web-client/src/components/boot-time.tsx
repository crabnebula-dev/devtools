import { Show } from "solid-js";
import { useState } from "~/lib/state";

export function BootTime() {
  const { state } = useState();

  return (
    <Show when={state.perfElapsed} fallback={"waiting for data..."}>
      {(e) => (
        <section>
          <strong>Loading time:</strong> <span class="font-mono">{Number(e().seconds) * 1000 + (e().nanos / 1e6)}ms</span>
        </section>
      )}
    </Show>
  );
}
