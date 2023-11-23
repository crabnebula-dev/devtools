import { For, Show, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { formatTimestamp, timestampToDate } from "~/lib/formatters";
import { Toolbar } from "~/components/toolbar";
import { useMonitor } from "~/context/monitor-provider";
import clsx from "clsx";
import { createStore } from "solid-js/store";
import { getLogMetadata } from "~/lib/console/get-log-metadata";
import { LogFilterObject, filterLogs } from "~/lib/console/filter-logs";
import { getLevelClasses } from "~/lib/console/get-level-classes";
import { LogLevelFilter } from "~/components/console/log-level-filter";
import { NoLogs } from "~/components/console/no-logs";

export default function Console() {
  const { monitorData } = useMonitor();
  const [showTimestamp, toggleTimeStamp] = createSignal(true);
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);
  const initialFilters = () => ({
    textContent: "",
    levels: [0, 1, 2, 3, 4],
  });
  const [filter, setFilter] = createStore<LogFilterObject>(initialFilters());
  const filteredLogs = () => filterLogs(monitorData, filter, monitorData.logs);
  const resetFilter = () => setFilter(initialFilters);

  return (
    <>
      <Toolbar>
        <input
          value={filter.textContent}
          onInput={(e) =>
            setFilter(() => ({ ...filter, textContent: e.currentTarget.value }))
          }
          type="text"
          placeholder="Filter..."
          class="bg-gray-900 px-1 rounded text-white"
        />
        <LogLevelFilter filter={filter} setFilter={setFilter} />
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
      </Toolbar>
      <AutoscrollPane
        dataStream={filteredLogs()[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <Show when={filteredLogs().length === 0}>
          <NoLogs filter={filter} reset={resetFilter} />
        </Show>
        <For each={filteredLogs()}>
          {(logEvent) => {
            const { message, at } = logEvent;
            if (!at) return null;

            const timeDate = timestampToDate(at);
            const levelStyle = getLevelClasses(
              getLogMetadata(monitorData, logEvent)?.level
            );

            return (
              <li
                class={clsx(
                  "p-1 font-mono text-sm border-b items-center flex",
                  levelStyle ? levelStyle : "border-b-gray-800 text-white"
                )}
              >
                <Show when={showTimestamp()}>
                  <time
                    dateTime={timeDate.toISOString()}
                    class={clsx(
                      levelStyle ? levelStyle : "text-gray-600",
                      "font-mono text-xs pr-4"
                    )}
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
