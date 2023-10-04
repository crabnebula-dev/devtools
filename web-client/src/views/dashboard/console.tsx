import { For, Show, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { formatTimestamp } from "~/lib/formaters";
import { useSocketData } from "~/lib/ws/context";
import { Log } from "~/lib/ws/types.ts"

const levelStyles: Record<Log['level'], string> = {
    TRACE: '',
    DEBUG: '',
    INFO: '',
    WARN: 'text-yellow-800 bg-yellow-400',
    ERROR: 'text-red-600 bg-red-300'
}

export default function Console() {
  const { data } = useSocketData();
  const [showTimestamp, toggleTimeStamp] = createSignal(true);
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  return (
    <>
      <div class="sticky h-toolbar top-0 bg-black bg-opacity-30 backdrop-blur flex justify-end border-b border-gray-800">
        <FilterToggle
          defaultPressed
          aria-label="time stamps"
          changeHandler={() => toggleTimeStamp((prev) => !prev)}
        >
          <span>Timestamps</span>
        </FilterToggle>
        <FilterToggle
          aria-label="auto scroll"
          defaultPressed
          changeHandler={() => toggleAutoScroll((prev) => !prev)}
        >
          <span>Autoscroll</span>
        </FilterToggle>
      </div>
      <AutoscrollPane
        dataStream={data.logs[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={data.logs}>
          {({ message, timestamp, level }) => {
            const timeDate = new Date(timestamp);

            return (
              <li class={`p-1 m-2 items-center rounded flex ${levelStyles[level]}`}>
                <Show when={showTimestamp()}>
                  <time
                    dateTime={timeDate.toISOString()}
                    class="font-mono pr-4"
                  >
                    {formatTimestamp(timeDate)}
                  </time>
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
