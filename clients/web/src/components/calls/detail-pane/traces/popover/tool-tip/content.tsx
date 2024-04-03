import type { JSXElement } from "solid-js";
import { Popover } from "@kobalte/core";

export function Content(props: { children: JSXElement }) {
  return (
    <>
      <Popover.Arrow />
      <table>{props.children}</table>
    </>
  );
}
