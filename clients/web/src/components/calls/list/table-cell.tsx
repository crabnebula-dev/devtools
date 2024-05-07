import type { JSXElement } from "solid-js";

export function TableCell(props: {
  title: string;
  height: number;
  children?: JSXElement;
}) {
  return (
    <td title={props.title}>
      <div
        class={`p-1 overflow-hidden text-ellipsis h-[${props.height}px] text-nowrap`}
      >
        {props.children ? props.children : props.title}
      </div>
    </td>
  );
}
