import { For, Show, createSignal } from "solid-js";
import { formatTimestamp } from "~/lib/formaters";
import { useSocketData } from "~/lib/ws-store";

export default function Console() {
  const { data } = useSocketData();
  const [showTimestamp, toggleTimeStamp] = createSignal(true);

  return (
    <>
      <button
        class="border border-neutral-200 rounded-lg py-px px-2"
        type="button"
        onClick={() => toggleTimeStamp((prev) => !prev)}
      >
        Show timestamp
      </button>
      <ul class="m-5 px-5 border border-neutral-800 rounded-md max-h-80 overflow-y-auto">
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
      </ul>
    </>
  );
}
