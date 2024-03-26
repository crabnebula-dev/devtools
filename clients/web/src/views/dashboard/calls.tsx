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
import { createMemo } from "solid-js";

function Calls() {
  const { monitorData } = useMonitor();

  let spanProcessingPointer = 0;

  const filteredCalls = createMemo<Span[]>((alreadyFiltered) => {
    const [filteredCalls, newPointer] = filterSpans(
      alreadyFiltered,
      spanProcessingPointer,
      monitorData.spans,
    );
    spanProcessingPointer = newPointer;
    return filteredCalls;
  }, []);

  return (
    <div class="h-[calc(100%-var(--toolbar-height))]">
      <Toolbar>
        <CallsClearButton />
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
