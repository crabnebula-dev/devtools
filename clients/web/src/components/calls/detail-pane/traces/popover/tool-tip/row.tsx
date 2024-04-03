import { type JSXElement, Show } from "solid-js";

export function Row(props: { title: string; children?: JSXElement }) {
  return (
    <tr class="grid grid-cols-2 text-left">
      <th style={{ "grid-column": props.children ? "" : "span 2" }}>
        {props.title}
      </th>
      <Show when={props.children}>
        <td>{props.children}</td>
      </Show>
    </tr>
  );
}
