import type { Span } from "~/lib/connection/monitor";
import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { getCallsTabBasePath } from "~/lib/calls/get-calls-tab-base-path";

export function RootLink(props: { rootSpan?: Span }) {
  const basePath = getCallsTabBasePath();
  return (
    <Show when={props.rootSpan}>
      {(rootSpan) => (
        <A href={`${basePath}?span=${rootSpan().id}`}>
          ↑ parent: {rootSpan().displayName ?? rootSpan().name}
        </A>
      )}
    </Show>
  );
}
