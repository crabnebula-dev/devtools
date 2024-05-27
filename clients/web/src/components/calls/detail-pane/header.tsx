import { RootLink } from "./root-link";
import type { Span } from "~/lib/connection/monitor";
import { determineCallColor } from "~/lib/calls/determine-call-color";
import clsx from "clsx";

export function Header(props: { call: Span }) {
  return (
    <div class="pt-4 px-4">
      <RootLink rootSpan={props.call.rootSpan} />
      <h2 class={clsx("text-2xl", determineCallColor(props.call))}>
        {props.call.displayName ?? props.call.name ?? "-"}
      </h2>
    </div>
  );
}
