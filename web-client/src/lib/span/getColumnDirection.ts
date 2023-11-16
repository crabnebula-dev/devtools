import type {
  SortDirection,
  SortableColumn,
  ColumnSort,
} from "~/views/dashboard/span-waterfall";

export function getColumnDirection(
  columnSort: ColumnSort,
  name: SortableColumn
): SortDirection {
  if (columnSort.name === name) {
    if (columnSort.direction === "asc") return "desc";
    return "asc";
  }

  return "asc";
}
