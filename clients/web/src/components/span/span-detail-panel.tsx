import { Show } from "solid-js";
import { SpanDetail } from "./span-detail";
import { Heading } from "../heading";
import { useSearchParams } from "@solidjs/router";
import { useMonitor } from "~/context/monitor-provider";

export function SpanDetailPanel() {
  const [searchParams] = useSearchParams();
  const { monitorData } = useMonitor();

  const span = () =>
    searchParams.span
      ? monitorData.spans.get(BigInt(searchParams.span))
      : undefined;

  return (
    <Show
      when={span()}
      fallback={
        <div class="h-full grid gap-4 text-center content-center justify-center items-center border-l p-4 border-gray-800">
          <Heading>No Span Selected</Heading>
          &larr; Pick a span to get started.
        </div>
      }
    >
      {(detailSpan) => <SpanDetail span={detailSpan()} />}
    </Show>
  );
}
