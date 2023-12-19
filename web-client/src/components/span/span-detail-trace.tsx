import { For } from "solid-js";
import { UiSpan } from "~/lib/span/format-spans-for-ui";
import { Span } from "~/lib/connection/monitor";
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
                {(slice) => <SpanDetailSlice slice={slice} />}
              </For>
            </div>
          </div>
        </td>
        <td class="py-1 px-4">{props.span.time.toFixed(2)}ms</td>
      </Popover.Trigger>
      <Popover.Portal>
        <SpanDetailPopOverContent span={props.span} />
      </Popover.Portal>
    </Popover.Root>
  );
}

function SpanDetailPopOverContent(props: { span: UiSpan }) {
  const busy = (span: Span) =>
    span.enters.reduce((acc, enter, i) => {
      const exit = span.exits[i];

      return acc + (exit.timestamp - enter.timestamp);
    }, 0);

  return (
    <Popover.Content
      class="z-50 bg-gray-700 rounded-sm drop-shadow-2xl px-2 py-1 focus:outline-none grid grid-cols-2"
      style={{ "max-width": "min(calc(100vw - 16px), 380px)" }}
    >
      <Popover.Arrow />
      <span>{props.span.name}</span>
      <span />
      <span>Busy</span>
      <span>{(busy(props.span.original) / 1e6).toFixed(3)}ms</span>
      <span>Idle</span>
      <span>
        {(props.span.time - busy(props.span.original) / 1e6).toFixed(3)}ms
      </span>
    </Popover.Content>
  );
}

function SpanDetailSlice(props: {
  slice: {
    entered: number;
    exited: number;
    threadID: number;
    width: number;
    marginLeft: number;
  };
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        class="absolute bg-teal-500 top-0 left-0 h-full hover:bg-teal-300"
        style={{
          width: `${props.slice.width}%`,
          "margin-left": `${props.slice.marginLeft}%`,
        }}
      />
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
            {((props.slice.exited - props.slice.entered) / 1e6).toFixed(3)}ms
          </span>
          <span>Thread</span>
          <span>{props.slice.threadID}</span>
          <span>Start</span>
          <span>{getDetailedTime(new Date(props.slice.entered / 1e6))}</span>
          <span>End</span>
          <span>{getDetailedTime(new Date(props.slice.exited / 1e6))}</span>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
