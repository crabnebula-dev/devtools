import { For, Show, createSignal } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { formatTimestamp, timestampToDate } from "~/lib/formatters";
import { useMonitor } from "~/lib/connection/monitor";
import { Toolbar } from "~/components/toolbar";
import {Metadata_Level, MetaId} from "~/lib/proto/common"

const levelStyles = (level: Metadata_Level | undefined) => {
    switch (level) {
        case 0:
            return 'text-red-600 bg-red-300';
        case 1:
            return 'text-yellow-800 bg-yellow-400';
        default:
            return ''
    }
}

export default function Console() {
  const { monitorData } = useMonitor();
  const [showTimestamp, toggleTimeStamp] = createSignal(true);
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  return (
    <>
      <Toolbar>
        <FilterToggle
          defaultPressed
          aria-label="time stamps"
          changeHandler={() => toggleTimeStamp((prev) => !prev)}
        >
          <span>Timestamps</span>
        </FilterToggle>
        <FilterToggle
          aria-label="auto scroll"
          defaultPressed
          changeHandler={() => toggleAutoScroll((prev) => !prev)}
        >
          <span>Autoscroll</span>
        </FilterToggle>
      </Toolbar>
      <AutoscrollPane
        dataStream={monitorData.logs[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={monitorData.logs}>
          {({ message, at, metadataId }) => {
            if (!at) return null;

            const timeDate = timestampToDate(at);
            const level = (metaId: MetaId) => monitorData.metadata.get(Number(metaId.id))?.level;

            return (
                <li class={`p-1 m-1 items-center rounded flex ${levelStyles(level(metadataId!))}`}>
                <Show when={showTimestamp()}>
                  <time
                    dateTime={timeDate.toISOString()}
                    class="font-mono pr-4"
                  >
                    {formatTimestamp(timeDate)}
                  </time>
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
