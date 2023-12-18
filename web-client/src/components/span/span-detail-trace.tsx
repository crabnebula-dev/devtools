import { For } from "solid-js";
import { UiSpan } from "~/lib/span/format-spans-for-ui";
import {
  computeWaterfallStyle,
  computeSlices,
} from "~/lib/span/normalize-spans";
import { Popover } from "@kobalte/core";
import { getDetailedTime } from "~/lib/formatters.ts";

export function SpanDetailTrace(props: {
  span: UiSpan;
  durations: {
    start: number;
    end: number;
    shortest: number;
    longest: number;
  };
}) {
  return (
    <tr class="even:bg-nearly-invisible cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]">
      <td class="py-1 px-4">{props.span.name}</td>
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
              props.durations.longest
            )}
          >
            {/* Slices is "time slices" as in multiple entry points to a given span */}
            <For each={computeSlices(props.span.original)}>
              {(slice) => (
                <Popover.Root>
                  <Popover.Trigger
                    class="absolute bg-teal-500 top-0 left-0 h-full"
                    style={{
                      width: `${slice.width}%`,
                      "margin-left": `${slice.marginLeft}%`,
                    }}
                  ></Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      class="z-50 bg-gray-800 rounded-sm drop-shadow-2xl p-1 focus:outline-none"
                      style={{ "max-width": "min(calc(100vw - 16px), 380px)" }}
                    >
                      <Popover.Arrow />
                      <p>
                        time:{" "}
                        {((slice.exited - slice.entered) / 1e6).toFixed(3)}ms
                      </p>
                      <p>on thread: {slice.threadID}</p>
                      <p>
                        entered:{" "}
                        {getDetailedTime(new Date(slice.entered / 1e6))}
                      </p>
                      <p>
                        exited: {getDetailedTime(new Date(slice.exited / 1e6))}
                      </p>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              )}
            </For>
          </div>
        </div>
      </td>
      <td class="py-1 px-4">{props.span.time.toFixed(2)}ms</td>
    </tr>
  );
}
