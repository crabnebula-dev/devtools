import { Tooltip } from "@kobalte/core";
import { Show } from "solid-js";

type Props = {
  granularity: number;
  setGranularity: (granularity: number) => void;
  totalDuration: number;
};

export function SpanScaleSlider(props: Props) {
  return (
    <div class="flex items-center gap-2">
      <Tooltip.Root>
        <Tooltip.Trigger>
          <span class="flex items-center gap-1">
            Scale Spans
            <Show when={props.granularity > 1}>
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
        max={props.totalDuration}
        value={props.granularity}
        onInput={(e) => props.setGranularity(Number(e.currentTarget.value))}
      />
    </div>
  );
}
