import { Toolbar } from "~/components/toolbar";
import { SplitPane } from "~/components/split-pane";
import { CallDetailPanel } from "~/components/calls/call-detail-panel";
import { CallsList } from "~/components/calls/calls-list";
import { CallsScaleSlider } from "~/components/calls/topbar/calls-scale-slider";
import { CallsContextProvider } from "~/components/calls/calls-context";
import { useMonitor } from "~/context/monitor-provider";
import { CallsClearButton } from "~/components/calls/topbar/calls-clear-button";
import { filterSpans } from "~/lib/span/filter-spans";
import { Span } from "~/lib/connection/monitor";
import { createMemo, createSignal } from "solid-js";
import { FilterToggle } from "~/components/filter-toggle";

function Calls() {
  const { monitorData } = useMonitor();

  const [textFilter, setTextFilter] = createSignal<string>("");
  const [showErrors, toggleErrorFilter] = createSignal(false);

  let spanProcessingPointer = 0;

  const selectedCalls = createMemo<Span[]>((alreadyFiltered) => {
    const [selectedCalls, newPointer] = filterSpans(
      alreadyFiltered,
      spanProcessingPointer,
      monitorData.spans,
    );
    spanProcessingPointer = newPointer;
    return selectedCalls;
  }, []);

  const filteredCalls = createMemo<Span[]>(() => {
    const onlyErrors = showErrors();
    const text = textFilter();
    return selectedCalls()
      .filter((s) => !onlyErrors || s.hasChildError || s.hasError)
      .filter(
        (s) =>
          !text ||
          s.name.includes(text) ||
          s.displayName?.includes(text) ||
          s.metadata?.target.includes(text) ||
          s.metadata?.location?.file?.includes(text),
      );
  });

  return (
    <div class="h-[calc(100%-var(--toolbar-height))]">
      <Toolbar>
        <CallsClearButton />
        <input
          value={textFilter()}
          onInput={(e) => setTextFilter(() => e.currentTarget.value)}
          type="text"
          placeholder="Filter..."
          class="bg-slate-900 px-1 rounded text-white focus:outline-none focus:border focus:border-slate-400"
        />
        <FilterToggle
          defaultPressed={showErrors()}
          aria-label="errors only"
          changeHandler={() => toggleErrorFilter((prev) => !prev)}
        >
          <span>Errors only</span>
        </FilterToggle>
        <span>Displayed calls: {filteredCalls().length}</span>
        <span>Running calls: {monitorData.durations.openSpans}</span>
        <CallsScaleSlider />
      </Toolbar>
      <SplitPane
        initialSizes={[70, 30]}
        defaultMinSizes={[50, 50]}
        defaultPrefix="span-waterfall"
      >
        <CallsList calls={filteredCalls()} />
        <CallDetailPanel />
      </SplitPane>
    </div>
  );
}

export default function CallsContext() {
  return (
    <CallsContextProvider>
      <Calls />
    </CallsContextProvider>
  );
}
