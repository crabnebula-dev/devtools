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
  const busy = () =>
    props.span.original.enters.reduce((acc, enter, i) => {
      const exit = props.span.original.exits[i];

      return acc + (exit.timestamp - enter.timestamp);
    }, 0);

  return (
    <Popover.Root>
      <Popover.Trigger
        class="even:bg-nearly-invisible cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]"
        as="tr"
      >
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
                      class="absolute bg-teal-500 top-0 left-0 h-full hover:bg-teal-300"
                      style={{
                        width: `${slice.width}%`,
                        "margin-left": `${slice.marginLeft}%`,
                      }}
                    ></Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        class="z-50 bg-gray-700 rounded-sm drop-shadow-2xl px-2 py-1 focus:outline-none grid grid-cols-2"
                        style={{
                          "max-width": "min(calc(100vw - 16px), 380px)",
                        }}
                      >
                        <Popover.Arrow />
                        <span>Time</span>
                        <span>
                          {((slice.exited - slice.entered) / 1e6).toFixed(3)}ms
                        </span>
                        <span>Thread</span>
                        <span>{slice.threadID}</span>
                        <span>Start</span>
                        <span>
                          {getDetailedTime(new Date(slice.entered / 1e6))}
                        </span>
                        <span>End</span>
                        <span>
                          {getDetailedTime(new Date(slice.exited / 1e6))}
                        </span>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                )}
              </For>
            </div>
          </div>
        </td>
        <td class="py-1 px-4">{props.span.time.toFixed(2)}ms</td>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          class="z-50 bg-gray-700 rounded-sm drop-shadow-2xl px-2 py-1 focus:outline-none grid grid-cols-2"
          style={{ "max-width": "min(calc(100vw - 16px), 380px)" }}
        >
          <Popover.Arrow />
          <span>{props.span.name}</span>
          <span />
          <span>Busy</span>
          <span>{(busy() / 1e6).toFixed(3)}ms</span>
          <span>Idle</span>
          <span>{(props.span.time - busy() / 1e6).toFixed(3)}ms</span>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
