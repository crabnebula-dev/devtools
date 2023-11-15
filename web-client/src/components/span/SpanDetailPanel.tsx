import { Show } from "solid-js";
import { SpanDetail } from "./SpanDetail";
import { useSearchParams } from "@solidjs/router";

export function SpanDetailPanel() {
  const [searchParams] = useSearchParams();
  return (
    <>
      <Show when={!searchParams.span}>
        <div class="h-full grid gap-4 text-center content-center justify-center items-center border-l p-4 border-gray-800">
          <h2 class="text-3xl font-bold">No Span Selected</h2>
          &larr; Pick a span to get started.
        </div>
      </Show>
      <Show when={searchParams.span}>
        <SpanDetail />
      </Show>
    </>
  );
}
