import { Show } from "solid-js";
import { SpanDetail } from "./span-detail";
import { useSearchParams } from "@solidjs/router";
import { Heading } from "../heading";

export function SpanDetailPanel() {
  const [searchParams] = useSearchParams();
  return (
    <>
      <Show when={!searchParams.span}>
        <div class="h-full grid gap-4 text-center content-center justify-center items-center border-l p-4 border-gray-800">
          <Heading>No Span Selected</Heading>
          &larr; Pick a span to get started.
        </div>
      </Show>
      <Show when={searchParams.span}>
        <SpanDetail />
      </Show>
    </>
  );
}
