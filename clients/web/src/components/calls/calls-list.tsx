import { For, Show, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import type { Span } from "~/lib/connection/monitor";
import { SortCaret } from "./topbar/sort-caret";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { CallsListTableRow } from "./list/calls-list-table-row";

import {
  type Column,
  type SortColumn,
  type SpanValues,
  type CurrentSort,
  sortCalls,
} from "~/lib/calls/calls-sorting";

export function CallsList(props: { calls: Span[] }) {
  let virtualList: HTMLDivElement | undefined;

  const columns: Column[] = [
    {
      name: "name",
      isSortable: true,
    },
    {
      name: "initiated",
      isSortable: true,
    },
    {
      name: "time",
      isSortable: true,
      modifier: (value: SpanValues, span: Span) =>
        value === -1 ? Date.now() - span.createdAt / 1e6 : value,
    },
    { name: "waterfall" },
  ];

  const [currentSort, setCurrentSort] = createStore<CurrentSort>({
    column: {
      name: "initiated",
      isSortable: true,
    },
    direction: "asc",
  });

  const sortedCalls = createMemo(() => {
    return [...props.calls.sort((a, b) => sortCalls(a, b, currentSort))];
  });

  const sortColumn = (column: SortColumn) => {
    setCurrentSort({
      column,
      direction:
        currentSort.column.name === column.name &&
        currentSort.direction === "asc"
          ? "desc"
          : "asc",
    });
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
                          "isSortable" in column
                        ) {
                          sortColumn(column);
                        }
                      }}
                      onClick={() =>
                        "isSortable" in column && sortColumn(column)
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
                        {currentSort.column.name === column.name &&
                          "isSortable" in column && (
                            <SortCaret direction={currentSort.direction} />
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
                const call = () => sortedCalls()[virtualRow.index];
                return (
                  <Show when={call()}>
                    {(currentCall) => (
                      <CallsListTableRow
                        call={currentCall()}
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
