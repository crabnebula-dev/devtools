import { Toolbar } from "~/components/toolbar";
import { createEffect, createSignal } from "solid-js";
import { formatSpansForUi } from "~/lib/span/format-spans-for-ui";
import { createStore } from "solid-js/store";
import { SplitPane } from "~/components/split-pane";
import { SpanDetailPanel } from "~/components/span/span-detail-panel";
import { ColumnSort, SpanList } from "~/components/span/span-list";
import { SpanScaleSlider } from "~/components/span/span-scale-slider";
import { FilteredSpan } from "~/lib/span/types";
import { getSpanKind } from "~/lib/span/get-span-kind";
import { useMonitor } from "~/context/monitor-provider";

export default function Calls() {
  const { monitorData } = useMonitor();
  const [granularity, setGranularity] = createSignal(1);
  const [spans, setSpans] = createSignal<ReturnType<typeof formatSpansForUi>>(
    []
  );
  const [columnSort, setColumnSort] = createStore<ColumnSort>({
    name: "initiated",
    direction: "asc",
  });

  createEffect(() => {
    const filteredSpans = () => {
      const filtered: FilteredSpan[] = [];

      for (const span of monitorData.spans) {
        const kind = getSpanKind({ metadata: monitorData.metadata, span });
        if (kind) {
          filtered.push({ kind, ...span });
        }
      }

      return filtered;
    };

    const hasPendingWork = () => filteredSpans().find((s) => s.closedAt < 0);
    const spans = () =>
      [
        ...formatSpansForUi({
          allSpans: monitorData.spans,
          spans: filteredSpans(),
          metadata: monitorData.metadata,
          granularity: granularity(),
        }),
      ].sort((a, b) => {
        const columnName = columnSort.name;

        let lhs, rhs;
        if (columnSort.direction == "asc") {
          lhs = a[columnName];
          rhs = b[columnName];
        } else {
          lhs = b[columnName];
          rhs = a[columnName];
        }

        if (typeof lhs == "number" && typeof rhs == "number") {
          return lhs - rhs;
        } else if (typeof lhs == "string" && typeof rhs == "string") {
          return lhs.localeCompare(rhs);
        } else {
          return 0; // no sorting
        }
      });

    function animate() {
      if (!hasPendingWork()) {
        return;
      }
      setSpans(spans());
      requestAnimationFrame(animate);
    }

    if (hasPendingWork()) {
      animate();
    }

    setSpans(spans());
  });

  const totalDuration = () =>
    Math.max(...spans().map((s) => s.time)) /
    Math.min(...spans().map((s) => s.time));

  return (
    <div class="h-[calc(100%-var(--toolbar-height))]">
      <Toolbar>
        <SpanScaleSlider
          granularity={granularity()}
          setGranularity={setGranularity}
          totalDuration={totalDuration()}
        />
      </Toolbar>
      <SplitPane
        initialSizes={[70, 30]}
        defaultMinSizes={[700, 300]}
        defaultPrefix="span-waterfall"
      >
        {[
          <SpanList
            columnSort={columnSort}
            setColumnSort={setColumnSort}
            spans={spans()}
          />,
          <SpanDetailPanel />,
        ]}
      </SplitPane>
    </div>
  );
}
