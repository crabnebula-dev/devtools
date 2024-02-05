import { createSignal } from "solid-js";
import { AutoScrollPane } from "~/components/auto-scroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { Toolbar } from "~/components/toolbar";
import { useMonitor } from "~/context/monitor-provider";
import { createStore } from "solid-js/store";
import { LogFilterObject, filterLogs } from "~/lib/console/filter-logs";
import { LogLevelFilter } from "~/components/console/log-level-filter";
import { NoLogs } from "~/components/console/no-logs";
import { LogEventEntry } from "~/components/console/log-event-entry";

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
      <AutoScrollPane
        dataStream={filteredLogs()}
        displayComponent={LogEventEntry}
        displayOptions={{ showTimestamp: showTimestamp() }}
        shouldAutoScroll={shouldAutoScroll}
        fallback={<NoLogs filter={filter} reset={resetFilter} />}
      />
    </>
  );
}
