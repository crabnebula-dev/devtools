import { For } from "solid-js";
import { Span } from "~/lib/connection/monitor";
import {
  computeWaterfallStyle,
  computeSlices,
} from "~/lib/span/normalize-spans";
import { Popover } from "@kobalte/core";
import clsx from "clsx";
import { useSearchParams } from "@solidjs/router";
import { determineCallColor } from "~/lib/calls/determine-call-color";
import { Content } from "./popover/content";
import { Slice } from "./slice";

export function Trace(props: {
  depth: number;
  span: Span;
  durations: {
    start: number;
    end: number;
    shortest: number;
    longest: number;
  };
}) {
  const [, setSearchParams] = useSearchParams();

  return (
    <Popover.Root>
      <Popover.Trigger
        class="even:bg-nearly-invisible cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]"
        as="tr"
      >
        <td
          class={clsx("py-1 px-4", determineCallColor(props.span))}
          onClick={() => {
            setSearchParams({ span: String(props.span.id) });
          }}
        >
          <span class="text-slate-800 text-xs">{"| ".repeat(props.depth)}</span>
          {props.span.displayName ?? props.span.name}
        </td>
        <td class="py-1 px-4 relative w-[70%]">
          <div class="relative">
            <div class="bg-gray-800 w-full absolute rounded-sm h-2" />
            <div
              class="relative h-2"
              style={computeWaterfallStyle(
                props.span,
                props.durations.start,
                props.durations.end,
                props.durations.shortest,
                props.durations.longest,
              )}
            >
              {/* Slices is "time slices" as in multiple entry points to a given span */}
              <For each={computeSlices(props.span)}>
                {(slice) => <Slice slice={slice} />}
              </For>
            </div>
          </div>
        </td>
        <td class="py-1 px-4">{props.span.time.toFixed(2)}ms</td>
      </Popover.Trigger>
      <Popover.Portal>
        <Content span={props.span} />
      </Popover.Portal>
    </Popover.Root>
  );
}
