import { createSignal, untrack, createEffect } from "solid-js";
import { AutoScrollPane } from "~/components/auto-scroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { Toolbar } from "~/components/toolbar";
import { useMonitor } from "~/context/monitor-provider";
import { createStore } from "solid-js/store";
import { LogFilterObject, filterLogs } from "~/lib/console/filter-logs";
import { LogLevelFilter } from "~/components/console/log-level-filter";
import { NoLogs } from "~/components/console/no-logs";
import { LogEvent } from "~/components/console/log-event";
import type { LogEvent as ILogEvent } from "~/lib/proto/logs";

export default function Console() {
  const { monitorData } = useMonitor();
  const [showAttributes, toggleAttributes] = createSignal(true);
  const [showTimestamp, toggleTimeStamp] = createSignal(true);
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);
  const initialFilters = () => ({
    textContent: "",
    levels: [0, 1, 2, 3, 4],
  });
  const [filter, setFilter] = createStore<LogFilterObject>(initialFilters());

  const [filteredLogs, setFilteredLogs] = createSignal<ILogEvent[]>([]);

  // If the filter changes we want to do a full filter on the list
  createEffect(() => {
    setFilteredLogs(
      filterLogs(
        untrack(() => monitorData),
        filter,
        untrack(() => monitorData.logs),
      ),
    );
  });

  // If there is new logs coming in, we only want to perform filtering on the newly received logs
  createEffect((oldLength: number) => {
    const newLength = monitorData.logs.length;

    // Partial filter
    if (newLength > oldLength) {
      const metadata = untrack(() => monitorData);
      const alreadyFilteredLogs = untrack(() => filteredLogs());
      setFilteredLogs(
        alreadyFilteredLogs.concat(
          filterLogs(
            metadata,
            untrack(() => filter),
            monitorData.logs.slice(oldLength - 1, newLength - 1),
          ),
        ),
      );
    }

    return newLength;
  }, 0);

  const resetFilter = () => setFilter(initialFilters);

  return (
    <>
      <Toolbar>
        <div>({filteredLogs().length})</div>
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
          aria-label="attributes"
          changeHandler={() => toggleAttributes((prev) => !prev)}
        >
          <span>Attributes</span>
        </FilterToggle>
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
      <AutoScrollPane
        dataStream={filteredLogs()}
        displayComponent={LogEvent}
        displayOptions={{
          showLinks: true,
          showAttributes: showAttributes(),
          showTimestamp: showTimestamp(),
        }}
        shouldAutoScroll={shouldAutoScroll}
        fallback={<NoLogs filter={filter} reset={resetFilter} />}
      />
    </>
  );
}
