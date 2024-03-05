import { useSearchParams } from "@solidjs/router";
import { For } from "solid-js";
import { createStore } from "solid-js/store";
import type { UiSpan } from "~/lib/span/format-spans-for-ui";
import { getColumnDirection } from "~/lib/span/get-column-direction";
import { SortCaret } from "./sort-caret";
import { getTime } from "~/lib/formatters";
import { useCalls } from "./calls-context";
import {
  computeColorClassName,
  computeSlices,
  computeWaterfallStyle,
} from "~/lib/span/normalize-spans";
import clsx from "clsx";

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

export function SpanList() {
  const callsContext = useCalls();
  const spans = callsContext.spans;

  const [columnSort, setColumnSort] = createStore<ColumnSort>({
    name: "initiated",
    direction: "asc",
  } satisfies ColumnSort);

  const columns = [
    { name: "name", isSortable: true },
    { name: "initiated", isSortable: true },
    { name: "time", isSortable: true },
    { name: "waterfall", isSortable: false },
  ] satisfies Column[];

  const [, setSearchParams] = useSearchParams();

  const filteredSpans = () => {
    const filteredSpans: UiSpan[] = [];
    spans.forEach((span) => {
      if (span.kind) {
        filteredSpans.push(span);
      }
    });
    return [...filteredSpans].sort(spanSort);
  };

  const sortColumn = (name: SortableColumn) => {
    setColumnSort({
      name,
      direction: getColumnDirection(columnSort, name),
    });
  };

  const spanSort = (a: UiSpan, b: UiSpan) => {
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
  };

  return (
    <table class="w-full table-fixed">
      <thead>
        <tr class="text-left">
          <For each={columns}>
            {(column) => {
              return (
                <th
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if ([" ", "Enter"].includes(e.key) && column.isSortable) {
                      sortColumn(column.name);
                    }
                  }}
                  onClick={() => column.isSortable && sortColumn(column.name)}
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
                    {columnSort.name === column.name && column.isSortable && (
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
        <For each={filteredSpans()}>
          {(span) => {
            return (
              <tr
                onClick={() => setSearchParams({ span: String(span.id) })}
                class="even:bg-nearly-invisible cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]"
              >
                <td class="p-1 overflow-hidden text-ellipsis" title={span.name}>
                  {span.name}
                </td>
                <td
                  class="p-1 overflow-hidden text-ellipsis"
                  title={getTime(new Date(span.initiated))}
                >
                  {getTime(new Date(span.initiated))}
                </td>
                <td
                  class="p-1 overflow-hidden text-ellipsis"
                  title={`${span.time.toFixed(2)} ms`}
                >
                  {span.time.toFixed(2)}ms
                </td>
                <td class="p-1 relative overflow-hidden">
                  <div class="relative w-[90%]">
                    <div class="bg-gray-800 w-full absolute rounded-sm h-2" />
                    <div
                      class={clsx(
                        "relative rounded-sm h-2",
                        computeColorClassName(
                          span.original.closedAt - span.original.createdAt,
                          callsContext.durations.durations.average,
                        ),
                      )}
                      style={computeWaterfallStyle(
                        span,
                        callsContext.durations.durations.start,
                        callsContext.durations.durations.end,
                      )}
                    >
                      <For each={computeSlices(span.original)}>
                        {(slice) => (
                          <div
                            class="absolute top-0 left-0 bg-black bg-opacity-10 h-full"
                            style={slice}
                          />
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
  );
}
