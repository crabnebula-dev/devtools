import { Span } from "../connection/monitor";

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

export type GenericSortColumn<T extends SpanProps> = {
  name: T;
  isSortable: boolean;
  modifier?: (value: Span[T], span: Span) => Span[T];
};

export type SortColumn = BaseColumn &
  { [K in SpanProps]: GenericSortColumn<K> }[SpanProps];

export function sortCalls(a: Span, b: Span, currentSort: CurrentSort) {
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
