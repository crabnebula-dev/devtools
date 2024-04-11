import { type JSXElement, Show } from "solid-js";
import { A } from "@solidjs/router";
import { encodeFileName } from "~/lib/sources/file-entries";
import { useConnection } from "~/context/connection-provider";

export function MaybeLinkedSource(props: {
  maybeRelativePath?: string;
  lineNumber?: number;
  class: string;
  children: JSXElement;
}) {
  const {
    connectionStore: { host, port },
  } = useConnection();

  const baseSources = `/dash/${host}/${port}/sources/`;

  return (
    <Show
      when={props.maybeRelativePath}
      fallback={<span class={props.class}>{props.children}</span>}
    >
      {(path) => (
        <A
          href={
            baseSources +
            encodeFileName(path()) +
            (props.lineNumber ? `#${props.lineNumber}` : "")
          }
          class={props.class}
        >
          {props.children}
        </A>
      )}
    </Show>
  );
}
