import type { SortDirection } from "../calls-list";

export function SortCaret(props: { direction: SortDirection }) {
  return (
    <span class="opacity-50 select-none text-xs">
      {props.direction === "asc" ? "▲" : "▼"}
    </span>
  );
}
