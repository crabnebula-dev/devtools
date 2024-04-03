import type { SortDirection } from "~/lib/calls/calls-sorting";

export function SortCaret(props: { direction: SortDirection }) {
  return (
    <span class="opacity-50 select-none text-xs">
      {props.direction === "asc" ? "▲" : "▼"}
    </span>
  );
}
