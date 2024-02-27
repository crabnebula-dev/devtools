import { Toolbar } from "~/components/toolbar";
import { SplitPane } from "~/components/split-pane";
import { SpanDetailPanel } from "~/components/span/span-detail-panel";
import { SpanList } from "~/components/span/span-list";
import { SpanScaleSlider } from "~/components/span/span-scale-slider";
import { CallsContextProvider } from "~/components/span/calls-context";
import { useMonitor } from "~/context/monitor-provider";
import { filterSpans } from "~/lib/span/filter-spans";
import { Span } from "~/lib/connection/monitor";
import { createMemo } from "solid-js";

function Calls() {
  const { monitorData } = useMonitor();

  let spanProcessingPointer = 0;

  const filteredSpans = createMemo<Span[]>((alreadyFiltered) => {
    const [filteredSpans, newPointer] = filterSpans(
      alreadyFiltered,
      spanProcessingPointer,
      monitorData.spans
    );
    spanProcessingPointer = newPointer;
    return filteredSpans;
  }, []);

  return (
    <div class="h-[calc(100%-var(--toolbar-height))]">
      <Toolbar>
        <span>{monitorData.durations.openSpans}</span>
        <SpanScaleSlider />
      </Toolbar>
      <SplitPane
        initialSizes={[70, 30]}
        defaultMinSizes={[600, 300]}
        defaultPrefix="span-waterfall"
      >
        <SpanList calls={filteredSpans()} />
        <SpanDetailPanel />
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
