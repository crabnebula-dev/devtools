import { ToggleButton } from "@kobalte/core";
import { For, Show, createSignal, on } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { formatTimestamp } from "~/lib/formaters";
import { useSocketData } from "~/lib/ws-store";

export default function Console() {
  const { data } = useSocketData();
  const [showTimestamp, toggleTimeStamp] = createSignal(true);
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  return (
    <>
      <ToggleButton.Root
        defaultPressed
        aria-label="timstamps"
        onChange={() => toggleTimeStamp((prev) => !prev)}
        class="py-px px-2 border rounded-lg"
      >
        {(state) => (
          <Show when={state.pressed()} fallback={<span>show timstamps</span>}>
            <span>hide timestamps</span>
          </Show>
        )}
      </ToggleButton.Root>
      {"   "}
      <ToggleButton.Root
        defaultPressed
        aria-label="auto scroll"
        class="py-px px-2 border rounded-lg"
        onChange={() => toggleAutoScroll((prev) => !prev)}
      >
        {(state) => (
          <Show when={state.pressed()} fallback={<span>autoscroll off</span>}>
            <span>autoscroll on</span>
          </Show>
        )}
      </ToggleButton.Root>

      <AutoscrollPane
        dataStream={data.logs[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={data.logs}>
          {({ message, timestamp }) => {
            const timeDate = new Date(timestamp);

            return (
              <li class="py-1 flex ">
                <Show when={showTimestamp()}>
                  <div class="text-right min-w-[9em]">
                    <time
                      dateTime={timeDate.toISOString()}
                      class="font-mono pr-4"
                    >
                      {formatTimestamp(timeDate)}
                    </time>
                  </div>
                </Show>
                <span>{message}</span>
              </li>
            );
          }}
        </For>
      </AutoscrollPane>
    </>
  );
}
