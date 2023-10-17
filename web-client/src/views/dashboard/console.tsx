import { For, Show, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { formatTimestamp, timestampToDate } from "~/lib/formatters";
import { useMonitor } from "~/lib/connection/monitor";

export default function Console() {
  const { monitorData } = useMonitor();
  const [showTimestamp, toggleTimeStamp] = createSignal(true);
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  return (
    <>
      <FilterToggle
        defaultPressed
        aria-label="time stamps"
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
        dataStream={monitorData.logs[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={monitorData.logs}>
          {({ message, at }) => {
            if (!at) return null;

            const timeDate = timestampToDate(at);

            return (
              <li class="py-1 flex ">
                <Show when={showTimestamp()}>
                  <div class="text-right min-w-[9em]">
                    <time
                      dateTime={timeDate.toISOString()}
                      class="font-mono pr-4"
                    >
                      {formatTimestamp(timeDate)}
                    </time>
                  </div>
                </Show>
                <span>{message}</span>
              </li>
            );
          }}
        </For>
      </AutoscrollPane>
    </>
  );
}
