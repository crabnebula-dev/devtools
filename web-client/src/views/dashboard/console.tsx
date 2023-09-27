import { For, Show, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { formatTimestamp } from "~/lib/formaters";
import { useSocketData } from "~/lib/ws/context";

export default function Console() {
  const { data } = useSocketData();
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
        dataStream={data.logs[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={data.logs}>
          {({ message, timestamp }) => {
            const timeDate = new Date(timestamp);

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
