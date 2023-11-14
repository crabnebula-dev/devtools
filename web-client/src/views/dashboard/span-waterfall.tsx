import { useMonitor } from "~/lib/connection/monitor";
import { Toolbar } from "~/components/toolbar";
import { For, createEffect, createSignal } from "solid-js";
import { FilterToggle } from "~/components/filter-toggle";
import { formatSpansForUi } from "~/lib/span/formatSpansForUi";
import { createStore } from "solid-js/store";
import { getColumnDirection } from "~/lib/span/getColumnDirection";
import { SortCaret } from "~/components/span/SortCaret";
import { sanitizeString } from "~/lib/span/sanitizeString";

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
  const [columnSort, setColumnSort] = createStore<ColumnSort>({
    name: "start",
    direction: "asc",
  });

  createEffect(() => {
    const filteredSpans = () => [
      ...monitorData.spans.filter((s) => {
        const metadata = monitorData.metadata.get(s.metadataId);
        return metadata && metadata.name.includes("ipc") && s.enteredAt;
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
      <table class="w-full">
        <thead>
          <tr class="text-left">
            <th
              onClick={() => {
                setColumnSort({
                  name: "name",
                  direction: getColumnDirection(columnSort, "name"),
                });
              }}
              class="p-1 cursor-pointer hover:bg-[#ffffff09]"
            >
              <div class="flex items-center gap-2">
                Name
                {columnSort.name === "name" && (
                  <SortCaret direction={columnSort.direction} />
                )}
              </div>
            </th>
            <th
              onClick={() => {
                setColumnSort({
                  name: "initiated",
                  direction: getColumnDirection(columnSort, "initiated"),
                });
              }}
              class="p-1 cursor-pointer hover:bg-[#ffffff09]"
            >
              <div class="flex items-center gap-2">
                Initiated
                {columnSort.name === "initiated" && (
                  <SortCaret direction={columnSort.direction} />
                )}
              </div>
            </th>
            <th
              onClick={() => {
                setColumnSort({
                  name: "time",
                  direction: getColumnDirection(columnSort, "time"),
                });
              }}
              class="p-1 cursor-pointer hover:bg-[#ffffff09]"
            >
              <div class="flex items-center gap-2">
                Time
                {columnSort.name === "time" && (
                  <SortCaret direction={columnSort.direction} />
                )}
              </div>
            </th>
            <th
              onClick={() => {
                setColumnSort({
                  name: "start",
                  direction: getColumnDirection(columnSort, "start"),
                });
              }}
              class="p-1 cursor-pointer hover:bg-[#ffffff09]"
            >
              <div class="flex items-center gap-2">
                Waterfall
                {columnSort.name === "start" && (
                  <SortCaret direction={columnSort.direction} />
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={spans()}>
            {(span) => {
              return (
                <tr class="even:bg-[#ffffff09] cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]">
                  <td class="p-1">{span.name}</td>
                  <td class="p-1">{span.initiated}</td>
                  <td class="p-1">{span.time}ms</td>
                  <td class="p-1 relative">
                    <div class="relative w-[90%]">
                      <div class="bg-gray-800 w-full absolute rounded-sm h-2"></div>
                      <div
                        class="bg-teal-500 rounded-sm relative h-2"
                        style={span.waterfall}
                      ></div>
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
