import { For, Show } from "solid-js";
import { useMonitor } from "~/lib/connection/monitor";
import { formatSpansForUi } from "~/lib/span/formatSpansForUi";
import { useSearchParams } from "@solidjs/router";
import { processFieldValue } from "~/lib/span/processFieldValue";
import { recursivelyFindSpanById } from "~/lib/span/recursivelyFindSpanById";
import { getEventPayload } from "~/lib/span/getEventPayload";

export function EventSpanDetail() {
  const [searchParams] = useSearchParams();
  const { monitorData } = useMonitor();
  const spanId = () => BigInt(searchParams.span);
  const span = () =>
    formatSpansForUi({
      spans: [recursivelyFindSpanById(monitorData.spans, spanId())!],
      metadata: monitorData.metadata,
    })[0];
  console.log(span());

  const payload = () =>
    getEventPayload({
      metadata: monitorData.metadata,
      rootSpan: recursivelyFindSpanById(monitorData.spans, spanId())!,
    })("window::emit")?.fields.map((f) => processFieldValue(f.payload))[0];

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800">
      <div class="pt-4 px-4">
        <h2 class="text-2xl">{span?.name ?? "-"}</h2>
      </div>
      <table>
        <tbody>
          <For each={span().children ?? []}>
            {(span) => {
              return (
                <tr class="even:bg-[#ffffff09] cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]">
                  <td class="py-1 px-4">{span.name}</td>
                  <td class="py-1 px-4 relative w-[60%]">
                    <div class="relative w-[90%]">
                      <div class="bg-gray-800 w-full absolute rounded-sm h-2" />
                      <div class="relative h-2" style={span.waterfall}>
                        {/* Slices is "time slices" as in multiple entry points to a given span */}
                        <For each={span.slices}>
                          {(slice) => (
                            <div
                              class="absolute bg-teal-500 top-0 left-0 h-full"
                              style={slice}
                            />
                          )}
                        </For>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            }}
          </For>
        </tbody>
      </table>
      <div class="grid gap-2">
        <h2 class="text-xl p-4">Payload</h2>
        <table>
          <tbody>
            <Show when={payload()}>
              {(payload) => {
                return (
                  <p class="py-1 px-4">
                    {typeof payload() === "object"
                      ? JSON.stringify(payload())
                      : String(payload())}
                  </p>
                );
              }}
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
}
