import { For, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { useState } from "~/lib/state";

export default function SpanWaterfall() {
  const { state } = useState();
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  return (
    <>
      <FilterToggle
        aria-label="auto scroll"
        defaultPressed
        fallbackElement={<span>autoscroll off</span>}
        changeHandler={() => toggleAutoScroll((prev) => !prev)}
      >
        <span>autoscroll on</span>
      </FilterToggle>

      <AutoscrollPane
        dataStream={state.spans[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={state.spans}>
          {(span) => {
            return (
              <li class="py-1 flex ">
                <pre>{JSON.stringify(span, null, 2)}</pre>
              </li>
            );
          }}
        </For>
      </AutoscrollPane>
    </>
  );
}
