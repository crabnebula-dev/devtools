import type { Span } from "~/lib/connection/monitor";
import clsx from "clsx";
import {
  Show,
  For,
  createSignal,
  onCleanup,
  onMount,
  createEffect,
} from "solid-js";
import { getTime } from "~/lib/formatters";
import type { JSX } from "solid-js/h/jsx-runtime";
import { computeSlices } from "~/lib/span/normalize-spans";
import {
  computeColorClassName,
  computeWaterfallStyle,
} from "~/lib/span/normalize-spans";
import { useCalls } from "./calls-context";
import { useSearchParams } from "@solidjs/router";
import { useMonitor } from "~/context/monitor-provider";

export function SpanTableRow(props: {
  span: Span;
  style: string | JSX.CSSProperties | undefined;
}) {
  const callsContext = useCalls();
  const { monitorData } = useMonitor();
  const [, setSearchParams] = useSearchParams();
  const [timePassed, setTimePassed] = createSignal(0);

  let lastRequest: number | undefined;

  function updateTimePassed() {
    if (props.span.closedAt < 0) {
      setTimePassed(Date.now() - props.span.createdAt / 1e6);
      lastRequest = window.requestAnimationFrame(updateTimePassed);
    }
  }

  function triggerAnimation() {
    if (lastRequest) cancelAnimationFrame(lastRequest);
    lastRequest = requestAnimationFrame(updateTimePassed);
    return "";
  }

  onCleanup(() => {
    if (lastRequest) cancelAnimationFrame(lastRequest);
  });

  createEffect((prevHealth) => {
    // If the connection goes bad we make sure to remove the unclosed spans from their pending state
    if (monitorData.health === 0 && lastRequest)
      cancelAnimationFrame(lastRequest);

    // If the connection comes back we have to clear the old calls
    if (prevHealth === 0 && monitorData.health === 1) callsContext.resetCalls();

    return monitorData.health;
  });

  return (
    <tr
      onClick={() => {
        setSearchParams({ span: String(props.span.id) });
      }}
      class="even:bg-nearly-invisible cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]"
      style={props.style}
    >
      <td class="p-1 overflow-hidden text-ellipsis" title={props.span.name}>
        {props.span.name}
      </td>
      <td
        class="p-1 overflow-hidden text-ellipsis"
        title={getTime(new Date(props.span.initiated))}
      >
        {getTime(new Date(props.span.initiated))}
      </td>
      <td
        class="p-1 overflow-hidden text-ellipsis"
        title={`${props.span.time.toFixed(2)} ms`}
      >
        <Show
          when={props.span.closedAt > -1}
          fallback={(triggerAnimation(), timePassed().toFixed(2) + "ms")}
        >
          {props.span.time.toFixed(2)}ms
        </Show>
      </td>
      <td class="p-1 relative overflow-hidden">
        <div class="relative w-[90%]">
          <div class="bg-gray-800 w-full absolute rounded-sm h-2" />
          <div
            class={clsx(
              "relative rounded-sm h-2",
              computeColorClassName(
                props.span.duration === -1
                  ? Date.now() * 1e6 - props.span.createdAt
                  : props.span.duration,
                monitorData.durations.average
              )
            )}
            style={computeWaterfallStyle(
              props.span,
              monitorData.durations.start ?? Date.now() * 1e6,
              monitorData.durations.openSpans > 0
                ? Date.now() * 1e6
                : monitorData.durations.end
            )}
          >
            <For each={computeSlices(props.span)}>
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
