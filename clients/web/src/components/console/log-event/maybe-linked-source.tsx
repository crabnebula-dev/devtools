import { type JSXElement, Show } from "solid-js";
import { A } from "@solidjs/router";
import { encodeFileName } from "~/lib/sources/file-entries";

export function MaybeLinkedSource(props: {
  baseSources: string;
  maybeRelativePath?: string;
  class: string;
  children: JSXElement;
}) {
  return (
    <Show
      when={props.maybeRelativePath}
      fallback={<span class={props.class}>{props.children}</span>}
    >
      {(path) => (
        <A
          href={props.baseSources + encodeFileName(path())}
          class={props.class}
        >
          {props.children}
        </A>
      )}
    </Show>
  );
}
