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
import { getFileNameFromPath } from "~/lib/console/get-file-name-from-path";
import { processFieldValue } from "~/lib/span/process-field-value.ts";

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
          class="bg-slate-900 px-1 rounded text-white focus:outline-none focus:border focus:border-slate-400"
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

            const metadata = getLogMetadata(monitorData, logEvent);
            const timeDate = timestampToDate(at);
            const levelStyle = getLevelClasses(metadata?.level);

            let target = metadata?.target;
            if (target === "log") {
              const field = logEvent.fields.find(
                (field) => field.name === "log.target"
              );
              if (field) {
                target = processFieldValue(field.value);
              }
            }

            return (
              <li
                class={clsx(
                  "p-1  font-mono text-sm items-center flex gap-4 odd:bg-slate-900 group",
                  levelStyle ? levelStyle : "border-b-gray-800 text-white"
                )}
              >
                <Show when={showTimestamp()}>
                  <time
                    dateTime={timeDate.toISOString()}
                    class={clsx(
                      levelStyle
                        ? levelStyle
                        : "text-slate-400 group-hover:text-slate-100",
                      "font-mono text-xs transition-colors"
                    )}
                  >
                    {formatTimestamp(timeDate)}
                  </time>
                </Show>
                <span class="group-hover:text-white text-slate-300 transition-colors">
                  {message}
                </span>
                <span class="ml-auto flex gap-2 items-center text-xs">
                  <Show when={target}>
                    {(logTarget) => (
                      <span class="text-slate-400 group-hover:text-slate-100 transition-colors">
                        {logTarget()}
                      </span>
                    )}
                  </Show>
                  <Show when={metadata?.location?.file}>
                    {(filePath) => (
                      <>
                        {getFileNameFromPath(filePath())}:
                        {metadata?.location?.line ?? ""}
                      </>
                    )}
                  </Show>
                </span>
              </li>
            );
          }}
        </For>
      </AutoscrollPane>
    </>
  );
}
