import { For, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { useSocketData } from "~/lib/ws/context";

export default function SpanWaterfall() {
  const { data } = useSocketData();
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  return (
    <>
      <FilterToggle
        aria-label="auto scroll"
        defaultPressed
        changeHandler={() => toggleAutoScroll((prev) => !prev)}
      >
        Autoscroll
      </FilterToggle>

      <AutoscrollPane
        dataStream={data.spans[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={data.spans}>
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
