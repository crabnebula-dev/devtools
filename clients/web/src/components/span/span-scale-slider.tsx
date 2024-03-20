import { Tooltip } from "@kobalte/core";
import { Show } from "solid-js";
import { useCalls } from "./calls-context";

export function SpanScaleSlider() {
  const callsContext = useCalls();
  return (
    <div class={"flex items-center gap-2"}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <span class="flex items-center gap-1">
            Scale Spans
            <Show when={callsContext.granularity.granularity() > 1}>
              <span>ⓘ</span>
            </Show>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <div class="rounded p-2 bg-black shadow">
            Concurrency may appear skewed when spans are scaled.
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
      <input
        type="range"
        min={1}
        max={10000}
        value={callsContext.granularity.granularity()}
        onInput={(e) =>
          callsContext.granularity.setGranularity(Number(e.currentTarget.value))
        }
      />
    </div>
  );
}
