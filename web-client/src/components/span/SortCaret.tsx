import type { SortDirection } from "~/views/dashboard/span-waterfall";

export function SortCaret(props: { direction: SortDirection }) {
  return (
    <span class="opacity-50 text-xs">
      {props.direction === "asc" ? "▲" : "▼"}
    </span>
  );
}
