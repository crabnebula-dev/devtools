import { SortCaret } from "../topbar/sort-caret";
import { For } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import type {
  SortColumn,
  CurrentSort,
  Column,
  SortDirection,
} from "~/lib/calls/calls-sorting";
import type { Span } from "~/lib/connection/monitor";

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
    /** Since unfinished calls have a time value of -1 we have to process it before sorting */
    modifier: (value: number, span: Span) =>
      value === -1 ? Date.now() - span.createdAt / 1e6 : value,
  },
  { name: "waterfall" },
];

export function CallsListTableHeader(props: {
  setCurrentSort: SetStoreFunction<CurrentSort>;
  currentSort: { column: SortColumn; direction: SortDirection };
}) {
  const sortColumn = (column: SortColumn) => {
    props.setCurrentSort({
      column,
      direction:
        props.currentSort.column.name === column.name &&
        props.currentSort.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  return (
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
                onClick={() => "isSortable" in column && sortColumn(column)}
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
                  {props.currentSort.column.name === column.name &&
                    "isSortable" in column && (
                      <SortCaret direction={props.currentSort.direction} />
                    )}
                </div>
              </th>
            );
          }}
        </For>
      </tr>
    </thead>
  );
}
