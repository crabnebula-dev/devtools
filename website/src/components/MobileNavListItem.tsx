import type { JSXElement } from "solid-js";

export const MobileNavListItem = (props: { children: JSXElement }) => (
  <li class="min-h-[48px] flex items-center">{props.children}</li>
);
