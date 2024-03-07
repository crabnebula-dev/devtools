import { For, Show, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import type { Span } from "~/lib/connection/monitor";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { CallsListTableRow } from "./list/calls-list-table-row";
import { CallsListTableHeader } from "./list/calls-list-table-header";
import { type CurrentSort, sortCalls } from "~/lib/calls/calls-sorting";

export function CallsList(props: { calls: Span[] }) {
  let virtualList: HTMLDivElement | undefined;

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
          <CallsListTableHeader
            setCurrentSort={setCurrentSort}
            currentSort={currentSort}
          />
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
