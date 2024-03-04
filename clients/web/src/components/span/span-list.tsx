import { For, Show, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import type { Span } from "~/lib/connection/monitor";
import { getColumnDirection } from "~/lib/span/get-column-direction";
import { SortCaret } from "./sort-caret";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { useMonitor } from "~/context/monitor-provider";
import { SpanTableRow } from "./span-table-row";

export type SortDirection = "asc" | "desc";

export type SortableColumn = "name" | "initiated" | "time";
export type ColumnSort = {
  name: SortableColumn;
  direction: SortDirection;
};

type Column = {
  name: SortableColumn | "waterfall";
  isSortable: boolean;
};

export function SpanList(props: { calls: Span[] }) {
  const { monitorData } = useMonitor();

  const spans = monitorData.spans;

  let virtualList: HTMLDivElement | undefined;

  const columns = [
    { name: "name", isSortable: true },
    { name: "initiated", isSortable: true },
    { name: "time", isSortable: true },
    { name: "waterfall", isSortable: false },
  ] satisfies Column[];

  const [columnSort, setColumnSort] = createStore<ColumnSort>({
    name: "initiated",
    direction: "asc",
  } satisfies ColumnSort);

  const spanSort = (a: Span, b: Span, sortColumn: ColumnSort) => {
    const columnName = sortColumn.name;
    let lhs, rhs;
    if (sortColumn.direction == "asc") {
      lhs =
        a[columnName] === -1 ? Date.now() - a.createdAt / 1e6 : a[columnName];
      rhs =
        b[columnName] === -1 ? Date.now() - b.createdAt / 1e6 : b[columnName];
    } else {
      lhs =
        b[columnName] === -1 ? Date.now() - b.createdAt / 1e6 : b[columnName];
      rhs =
        a[columnName] === -1 ? Date.now() - a.createdAt / 1e6 : a[columnName];
    }

    if (typeof lhs == "number" && typeof rhs == "number") {
      return lhs - rhs;
    } else if (typeof lhs == "string" && typeof rhs == "string") {
      return lhs.localeCompare(rhs);
    } else {
      return 0; // no sorting
    }
  };

  function sort(spans: Span[]) {
    return [...spans.sort((a, b) => spanSort(a, b, columnSort))];
  }

  const sortedSpans = createMemo(() => {
    return sort(props.calls);
  });

  const sortColumn = (name: SortableColumn) => {
    setColumnSort({
      name,
      direction: getColumnDirection(columnSort, name),
    });
    virtualizer.measure();
  };

  const virtualizer = createVirtualizer({
    get count() {
      return props.calls.length;
    },
    getScrollElement: () => virtualList ?? null,
    estimateSize: () => 32,
    overscan: 5,
  });

  return (
    <div ref={virtualList} class="overflow-auto max-h-full h-full relative">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <table class="w-full table-fixed">
          <thead class="sticky">
            <tr class="text-left">
              <For each={columns}>
                {(column) => {
                  return (
                    <th
                      tabIndex="0"
                      onKeyDown={(e) => {
                        if (
                          [" ", "Enter"].includes(e.key) &&
                          column.isSortable
                        ) {
                          sortColumn(column.name);
                        }
                      }}
                      onClick={() =>
                        column.isSortable && sortColumn(column.name)
                      }
                      class={`p-1 cursor-pointer hover:bg-[#ffffff09] ${
                        column.name === "time" || column.name === "initiated"
                          ? "w-2/12" // time and initiated
                          : column.name === "name"
                          ? "w-3/12" // name
                          : "w-5/12" // waterfall
                      }`}
                    >
                      <div class="flex uppercase select-none items-center gap-2">
                        {column.name}
                        {columnSort.name === column.name &&
                          column.isSortable && (
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
            <For each={virtualizer.getVirtualItems()}>
              {(virtualRow, index) => {
                const span = () =>
                  spans.get(sortedSpans()[virtualRow.index]?.id);
                return (
                  <Show when={span()}>
                    {(currentSpan) => (
                      <SpanTableRow
                        span={currentSpan()}
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${
                            virtualRow.start - index() * virtualRow.size
                          }px)`,
                        }}
                      />
                    )}
                  </Show>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}
