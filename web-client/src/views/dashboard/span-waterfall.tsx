import { For, Show, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { formatTimestamp } from "~/lib/formaters";
import { useSocketData } from "~/lib/ws-store";

export default function SpanWaterfall() {
  const { data } = useSocketData();
  const [showTimestamp, toggleTimeStamp] = createSignal(true);
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  return (
    <>
      <FilterToggle
        defaultPressed
        aria-label="timstamps"
        changeHandler={() => toggleTimeStamp((prev) => !prev)}
        fallbackElement={<span>show timestamp</span>}
      >
        <span>hide timestamps</span>
      </FilterToggle>
      {"   "}
      <FilterToggle
        aria-label="auto scroll"
        defaultPressed
        fallbackElement={<span>autoscroll off</span>}
        changeHandler={() => toggleAutoScroll((prev) => !prev)}
      >
        <span>autoscroll on</span>
      </FilterToggle>

      <AutoscrollPane
        dataStream={data.logs[0]}
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
