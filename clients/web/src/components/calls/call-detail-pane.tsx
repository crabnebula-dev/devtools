import { Show } from "solid-js";
import { Detail } from "./detail-pane/detail";
import { Heading } from "../heading";
import { useSearchParams } from "@solidjs/router";
import { useMonitor } from "~/context/monitor-provider";

export function CallDetailPane() {
  const [searchParams] = useSearchParams();
  const { monitorData } = useMonitor();

  const call = () =>
    searchParams.span
      ? monitorData.spans.get(BigInt(searchParams.span))
      : undefined;

  return (
    <Show
      when={call()}
      fallback={
        <div class="h-full grid gap-4 text-center content-center justify-center items-center border-l p-4 border-gray-800 min-w-[200px]">
          <Heading>No Call Selected</Heading>
          &larr; Pick a call to get started.
        </div>
      }
    >
      {(detailCall) => <Detail call={detailCall()} />}
    </Show>
  );
}
