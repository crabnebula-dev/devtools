import type { Span } from "~/lib/connection/monitor";
import clsx from "clsx";
import { Show, For, createSignal, onCleanup, createEffect } from "solid-js";
import { getTime } from "~/lib/formatters";
import type { JSX } from "solid-js/h/jsx-runtime";
import { computeSlices } from "~/lib/span/normalize-spans";
import {
  computeColorClassName,
  computeWaterfallStyle,
} from "~/lib/span/normalize-spans";
import { useSearchParams } from "@solidjs/router";
import { useMonitor } from "~/context/monitor-provider";

export function CallsListTableRow(props: {
  call: Span;
  style: string | JSX.CSSProperties | undefined;
}) {
  const { monitorData } = useMonitor();
  const [, setSearchParams] = useSearchParams();
  const [timePassed, setTimePassed] = createSignal(0);

  let lastRequest: number | undefined;

  function updateTimePassed() {
    if (props.call.closedAt < 0) {
      setTimePassed(Date.now() - props.call.createdAt / 1e6);
      lastRequest = window.requestAnimationFrame(updateTimePassed);
      return;
    }

    lastRequest = undefined;
  }

  function triggerAnimation() {
    if (monitorData.health === 0 || props.call.aborted) {
      setTimePassed(-1);
      return "";
    }

    if (lastRequest) cancelAnimationFrame(lastRequest);
    lastRequest = requestAnimationFrame(updateTimePassed);
    return "";
  }

  onCleanup(() => {
    if (lastRequest) cancelAnimationFrame(lastRequest);
  });

  createEffect(() => {
    // If the connection goes bad we make sure to remove the unclosed spans from their pending state
    if (monitorData.health === 0 && lastRequest) {
      setTimePassed(-1);
      cancelAnimationFrame(lastRequest);
    }
  });

  return (
    <tr
      onClick={() => {
        setSearchParams({ span: String(props.call.id) });
      }}
      class="even:bg-nearly-invisible cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]"
      style={props.style}
    >
      <td class="p-1 overflow-hidden text-ellipsis" title={props.call.name}>
        {props.call.name}
      </td>
      <td
        class="p-1 overflow-hidden text-ellipsis"
        title={getTime(new Date(props.call.initiated))}
      >
        {getTime(new Date(props.call.initiated))}
      </td>
      <td
        class="p-1 overflow-hidden text-ellipsis"
        title={`${props.call.time.toFixed(2)} ms`}
      >
        <Show
          when={props.call.closedAt > -1}
          fallback={(triggerAnimation(), timePassed().toFixed(2) + "ms")}
        >
          {props.call.time.toFixed(2)}ms
        </Show>
      </td>
      <td class="p-1 relative overflow-hidden">
        <div class="relative w-[90%]">
          <div class="bg-gray-800 w-full absolute rounded-sm h-2" />
          <div
            class={clsx(
              "relative rounded-sm h-2",
              computeColorClassName(
                props.call.duration === -1
                  ? Date.now() * 1e6 - props.call.createdAt
                  : props.call.duration,
                monitorData.durations.average,
              ),
            )}
            style={computeWaterfallStyle(
              props.call,
              monitorData.durations.start ?? Date.now() * 1e6,
              monitorData.durations.openSpans > 0
                ? Date.now() * 1e6
                : monitorData.durations.end,
            )}
          >
            <For each={computeSlices(props.call)}>
              {(slice) => (
                <div
                  class="absolute top-0 left-0 bg-black bg-opacity-10 h-full"
                  style={slice}
                />
              )}
            </For>
          </div>
        </div>
      </td>
    </tr>
  );
}
