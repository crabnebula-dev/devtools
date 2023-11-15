import { useMonitor } from "~/lib/connection/monitor";
import { Toolbar } from "~/components/toolbar";
import { For, createEffect, createSignal } from "solid-js";
import { FilterToggle } from "~/components/filter-toggle";
import { formatSpansForUi } from "~/lib/span/formatSpansForUi";
import { createStore } from "solid-js/store";
import { getColumnDirection } from "~/lib/span/getColumnDirection";
import { SortCaret } from "~/components/span/SortCaret";
import { sanitizeString } from "~/lib/span/sanitizeString";
import { resolveColumnAlias } from "~/lib/span/resolveColumnAlias";
import { getTime } from "~/lib/formatters";

export type SortableColumn = keyof ReturnType<typeof formatSpansForUi>[-1];
export type SortDirection = "asc" | "desc";
export type ColumnSort = {
  name: SortableColumn;
  direction: SortDirection;
};

export default function SpanWaterfall() {
  const { monitorData } = useMonitor();
  const [shouldAutoScroll, setAutoScroll] = createSignal(true);
  const [spans, setSpans] = createSignal<ReturnType<typeof formatSpansForUi>>(
    []
  );
  const columns = () =>
    [...Object.keys(spans()?.[0] ?? {})].filter((k) =>
      ["name", "initiated", "time", "waterfall"].includes(k)
    );
  const [columnSort, setColumnSort] = createStore<ColumnSort>({
    name: "start",
    direction: "asc",
  });

  createEffect(() => {
    const filteredSpans = () => [
      ...monitorData.spans.filter((s) => {
        const metadata = monitorData.metadata.get(s.metadataId);
        return metadata && metadata.name.includes("ipc") && s.closedAt;
      }),
    ];

    setSpans(
      [
        ...formatSpansForUi({
          spans: filteredSpans(),
          metadata: monitorData.metadata,
        }),
      ].sort((a, b) => {
        const columnName = columnSort.name;
        const lhs = a[columnName];
        const rhs = b[columnName];

        if (columnSort.direction === "asc") {
          return sanitizeString(lhs) - sanitizeString(rhs);
        }
        return sanitizeString(rhs) - sanitizeString(lhs);
      })
    );
  });

  const sortColumn = (name: SortableColumn) => {
    setColumnSort({
      name,
      direction: getColumnDirection(columnSort, name),
    });
  };

  return (
    <div>
      <Toolbar>
        <FilterToggle
          defaultPressed
          aria-label="Autoscroll"
          changeHandler={() => setAutoScroll(!shouldAutoScroll())}
        >
          Autoscroll
        </FilterToggle>
      </Toolbar>
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
                <tr class="even:bg-[#ffffff09] cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]">
                  <td class="p-1">{span.name}</td>
                  <td class="p-1">{getTime(new Date(span.initiated))}</td>
                  <td class="p-1">{span.time}ms</td>
                  <td class="p-1 relative">
                    <div class="relative w-[90%]">
                      <div class="bg-gray-800 w-full absolute rounded-sm h-2" />
                      <div
                        class="bg-teal-500 rounded-sm relative h-2"
                        style={span.waterfall}
                      />
                    </div>
                  </td>
                </tr>
              );
            }}
          </For>
        </tbody>
      </table>
    </div>
  );
}
