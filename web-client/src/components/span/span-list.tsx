import { useSearchParams } from "@solidjs/router";
import { For } from "solid-js";
import type { UiSpan, formatSpansForUi } from "~/lib/span/format-spans-for-ui";
import { getColumnDirection } from "~/lib/span/get-column-direction";
import { resolveColumnAlias } from "~/lib/span/resolve-column-alias";
import { SortCaret } from "./sort-caret";
import { getTime } from "~/lib/formatters";
import clsx from "clsx";

export type SortDirection = "asc" | "desc";
export type SortableColumn = keyof ReturnType<typeof formatSpansForUi>[-1];
export type ColumnSort = {
  name: SortableColumn;
  direction: SortDirection;
};

type Props = {
  spans: UiSpan[];
  columnSort: ColumnSort;
  setColumnSort: (columnSort: ColumnSort) => void;
};

export function SpanList(props: Props) {
  const columns = () =>
    [...Object.keys(props.spans?.[0] ?? {})].filter((k) =>
      ["name", "initiated", "time", "waterfall"].includes(k)
    );
  const [, setSearchParams] = useSearchParams();

  const sortColumn = (name: SortableColumn) => {
    props.setColumnSort({
      name,
      direction: getColumnDirection(props.columnSort, name),
    });
  };

  return (
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
                    {props.columnSort.name === resolvedColumn && (
                      <SortCaret direction={props.columnSort.direction} />
                    )}
                  </div>
                </th>
              );
            }}
          </For>
        </tr>
      </thead>
      <tbody>
        <For each={props.spans}>
          {(span) => {
            return (
              <tr
                onClick={() => setSearchParams({ span: span.id })}
                class="even:bg-nearly-invisible cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]"
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
