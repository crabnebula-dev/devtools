import type { SortDirection } from "~/views/dashboard/calls";

export function SortCaret(props: { direction: SortDirection }) {
  return (
    <span class="opacity-50 select-none text-xs">
      {props.direction === "asc" ? "▲" : "▼"}
    </span>
  );
}
