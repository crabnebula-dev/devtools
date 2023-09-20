import { For } from "solid-js";
import { useSocketData } from "~/lib/ws-store";

function formatTimestamp(stamp: Date) {
  return `${stamp.getHours()}:${stamp.getMinutes()}:${stamp.getSeconds()}`;
}

export default function Console() {
  const { data } = useSocketData();

  return (
    <>
      <ul>
        <For each={data.logs}>
          {({ message, timestamp }) => {
            const timeDate = new Date(timestamp);
            return (
              <li class="py-1">
                <time dateTime={timeDate.toISOString()} class="font-mono pr-4">
                  {formatTimestamp(timeDate)}
                </time>
                <span>{message}</span>
              </li>
            );
          }}
        </For>
      </ul>
    </>
  );
}
