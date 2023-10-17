import { For, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { useMonitor } from "~/lib/connection/monitor";

export default function SpanWaterfall() {
  const { monitorData } = useMonitor();
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
        dataStream={monitorData.spans[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={monitorData.spans}>
          {(span) => {
            return (
              <li class="py-1 flex ">
                <pre>
                  {JSON.stringify(
                    span,
                    (_, v) => (typeof v === "bigint" ? v.toString() : v),
                    2
                  )}
                </pre>
              </li>
            );
          }}
        </For>
      </AutoscrollPane>
    </>
  );
}
