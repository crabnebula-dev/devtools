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

  const [showErrors, toggleErrorFilter] = createSignal(false);

  let spanProcessingPointer = 0;

  const filteredCalls = createMemo<Span[]>((alreadyFiltered) => {
    const onlyErrors = showErrors();
    const [filteredCalls, newPointer] = filterSpans(
      alreadyFiltered,
      spanProcessingPointer,
      monitorData.spans,
    );
    spanProcessingPointer = newPointer;
    // TODO: this is not reactive when spans are marked as error later.
    return filteredCalls.filter(
      (s) => !onlyErrors || s.hasChildError || s.hasError,
    );
  }, []);

  return (
    <div class="h-[calc(100%-var(--toolbar-height))]">
      <Toolbar>
        <CallsClearButton />
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
