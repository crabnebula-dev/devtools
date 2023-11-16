import { useMonitor } from "~/lib/connection/monitor";
import { Toolbar } from "~/components/toolbar";
import { For, createEffect, createSignal } from "solid-js";
import { formatSpansForUi } from "~/lib/span/formatSpansForUi";
import { createStore } from "solid-js/store";
import { getColumnDirection } from "~/lib/span/getColumnDirection";
import { SortCaret } from "~/components/span/SortCaret";
import { resolveColumnAlias } from "~/lib/span/resolveColumnAlias";
import { getTime } from "~/lib/formatters";
import { SplitPane } from "~/components/split-pane";
import { useSearchParams } from "@solidjs/router";
import { SpanDetailPanel } from "~/components/span/SpanDetailPanel";
import clsx from "clsx";
import { Tooltip } from "@kobalte/core";

export type SortableColumn = keyof ReturnType<typeof formatSpansForUi>[-1];
export type SortDirection = "asc" | "desc";
export type ColumnSort = {
  name: SortableColumn;
  direction: SortDirection;
};

export default function SpanWaterfall() {
  const [, setSearchParams] = useSearchParams();
  const { monitorData } = useMonitor();
  const [granularity, setGranularity] = createSignal(1);
  const [spans, setSpans] = createSignal<ReturnType<typeof formatSpansForUi>>(
    []
  );
  const columns = () =>
    [...Object.keys(spans()?.[0] ?? {})].filter((k) =>
      ["name", "initiated", "time", "waterfall"].includes(k)
    );
  const [columnSort, setColumnSort] = createStore<ColumnSort>({
    name: "initiated",
    direction: "asc",
  });

  createEffect(() => {
    const filteredSpans = () => [
      ...monitorData.spans.filter((s) => {
        const metadata = monitorData.metadata.get(s.metadataId);
        return metadata && metadata.name.includes("ipc") && s.closedAt;
      }),
    ];

    const hasPendingWork = () => filteredSpans().find((s) => s.closedAt < 0);
    const spans = () =>
      [
        ...formatSpansForUi({
          spans: filteredSpans(),
          metadata: monitorData.metadata,
          granularity: granularity(),
        }),
      ].sort((a, b) => {
        const columnName = columnSort.name;
        const lhs = a[columnName];
        const rhs = b[columnName];

        if (typeof lhs !== "number" || typeof rhs !== "number") {
          throw new Error("Cannot sort non-numeric values");
        }

        if (columnSort.direction === "asc") {
          return lhs - rhs;
        }
        return rhs - lhs;
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

  const sortColumn = (name: SortableColumn) => {
    setColumnSort({
      name,
      direction: getColumnDirection(columnSort, name),
    });
  };

  const totalDuration = () =>
    Math.max(...spans().map((s) => s.time)) /
    Math.min(...spans().map((s) => s.time));

  return (
    <div class="h-[calc(100%-28px)]">
      <Toolbar>
        <div class="flex items-center gap-2">
          <Tooltip.Root>
            <Tooltip.Trigger>Scale Spans</Tooltip.Trigger>
            <Tooltip.Content>
              <div class="rounded p-2 bg-black shadow">
                Concurrency may be skewed when spans are scaled.
              </div>
            </Tooltip.Content>
          </Tooltip.Root>
          <input
            type="range"
            min={1}
            max={totalDuration()}
            value={granularity()}
            onInput={(e) => setGranularity(Number(e.currentTarget.value))}
          />
        </div>
      </Toolbar>
      <SplitPane
        defaultPrefix="span-waterfall"
        leftPaneComponent={
          <table class="w-full table-fixed">
            <thead>
              <tr class="text-left">
                <For each={columns()}>
                  {(column) => {
                    const resolvedColumn = resolveColumnAlias(
                      column as SortableColumn
                    );
                    return (
                      <th
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if ([" ", "Enter"].includes(e.key)) {
                            sortColumn(resolvedColumn);
                          }
                        }}
                        onClick={() => sortColumn(resolvedColumn)}
                        class="p-1 cursor-pointer hover:bg-[#ffffff09]"
                      >
                        <div class="flex uppercase select-none items-center gap-2">
                          {column}
                          {columnSort.name === resolvedColumn && (
                            <SortCaret direction={columnSort.direction} />
                          )}
                        </div>
                      </th>
                    );
                  }}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={spans()}>
                {(span) => {
                  return (
                    <tr
                      onClick={() => setSearchParams({ span: span.id })}
                      class="even:bg-[#ffffff09] cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]"
                    >
                      <td class="p-1">{span.name}</td>
                      <td class="p-1">{getTime(new Date(span.initiated))}</td>
                      <td class="p-1">{span.time.toFixed(2)}ms</td>
                      <td class="p-1 relative">
                        <div class="relative w-[90%]">
                          <div class="bg-gray-800 w-full absolute rounded-sm h-2" />
                          <div
                            class={clsx(
                              "relative rounded-sm h-2",
                              span.colorClassName
                            )}
                            style={span.waterfall}
                          >
                            <For each={span.slices}>
                              {(slice) => (
                                <div
                                  class="absolute top-0 left-0 bg-black bg-opacity-10 h-full"
                                  style={slice}
                                ></div>
                              )}
                            </For>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        }
        rightPaneComponent={<SpanDetailPanel />}
      />
    </div>
  );
}
