import { Toolbar } from "~/components/toolbar";
import { createEffect } from "solid-js";
import { SplitPane } from "~/components/split-pane";
import { SpanDetailPanel } from "~/components/span/span-detail-panel";
import { SpanList } from "~/components/span/span-list";
import { SpanScaleSlider } from "~/components/span/span-scale-slider";
import { useMonitor } from "~/context/monitor-provider";
import { CallsContextProvider } from "~/components/span/calls-context";
import { updateUiSpansFromStream } from "~/lib/span/update-ui-spans-from-stream";

function Calls() {
  const { monitorData } = useMonitor();

  createEffect(() => {
    updateUiSpansFromStream(monitorData.spans);
  });

  return (
    <div class="h-[calc(100%-var(--toolbar-height))]">
      <Toolbar>
        <SpanScaleSlider />
      </Toolbar>
      <SplitPane
        initialSizes={[70, 30]}
        defaultMinSizes={[600, 300]}
        defaultPrefix="span-waterfall"
      >
        <SpanList />
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
