import { Span } from "../connection/monitor";

export type SortableColumns = keyof Pick<Span, "name" | "initiated" | "time">;

export type SortDirection = "asc" | "desc";

export type CurrentSort = {
  column: SortColumn;
  direction: SortDirection;
};

export type Column = BaseColumn | SortColumn;

export type BaseColumn = {
  name: string;
};

type SpanProps = keyof Span;

export type SortColumn = SortColumns[SortableColumns];

type SortColumns = {
  [K in SortableColumns]: GenericSortColumn<K>;
};

export type GenericSortColumn<T extends SpanProps> = {
  name: T;
  isSortable: boolean;
  modifier?: (value: Span[T], span: Span) => Span[T];
};

export function sortCalls<ColumnKey extends SortableColumns>(
  a: Span,
  b: Span,
  currentSort: {
    column: SortColumns[ColumnKey];
    direction: SortDirection;
  },
) {
  let lhs = a[currentSort.column.name];
  let rhs = b[currentSort.column.name];

  if (currentSort.column.modifier) {
    lhs = currentSort.column.modifier(lhs, a);
    rhs = currentSort.column.modifier(rhs, b);
  }

  if (currentSort.direction === "desc") {
    const temp = lhs;
    lhs = rhs;
    rhs = temp;
  }

  switch (typeof lhs) {
    case "string":
      return lhs.localeCompare(rhs as string);
    case "number":
      return (lhs as number) - (rhs as number);
    default:
      return 0;
  }
}
