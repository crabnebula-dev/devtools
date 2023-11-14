import { useMonitor } from "~/lib/connection/monitor";
import { Toolbar } from "~/components/toolbar";
import { For, createEffect, createSignal } from "solid-js";
import { convertTimestampToNanoseconds, formatDate } from "~/lib/formatters";
import { normalizeSpans } from "~/lib/span/normalizeSpans";
import { FilterToggle } from "~/components/filter-toggle";

export default function SpanWaterfall() {
  const { monitorData } = useMonitor();
  const [shouldAutoScroll, setAutoScroll] = createSignal(true);
  const [spans, setSpans] = createSignal<ReturnType<typeof normalizeSpans>>([]);

  createEffect(() => {
    const filteredSpans = () =>
      monitorData.spans.filter((s) => {
        const metadata = monitorData.metadata.get(s.metadataId);
        return metadata && metadata.name.includes("ipc");
      });

    setSpans(normalizeSpans(filteredSpans()));
  });

  return (
    <div>
      <Toolbar>
        <FilterToggle
          defaultPressed
          aria-label="Autoscroll"
          changeHandler={() => setAutoScroll(!shouldAutoScroll())}
        >
          Autoscroll
        </FilterToggle>
      </Toolbar>
      <table class="w-full">
        <thead>
          <tr class="text-left">
            <th class="p-1">Name</th>
            <th class="p-1">Target</th>
            <th class="p-1">Initiated</th>
            <th class="p-1">Time</th>
            <th class="p-1">Waterfall</th>
          </tr>
        </thead>
        <tbody>
          <For each={spans()}>
            {(span, i) => {
              const metadata = () =>
                monitorData.metadata.get(spans()[i()].metadataId);
              const createdAt = convertTimestampToNanoseconds(span.createdAt!);
              const exitedAt = convertTimestampToNanoseconds(span.exitedAt!);
              const enteredAt = convertTimestampToNanoseconds(span.enteredAt!);
              return (
                <tr class="even:bg-[#ffffff09] cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]">
                  <td class="p-1">{metadata()!.name}</td>
                  <td class="p-1">{metadata()?.target}</td>
                  <td class="p-1">
                    {formatDate(new Date(createdAt / 1000000))}
                  </td>
                  <td class="p-1">{(exitedAt - enteredAt) / 1e6}ms</td>
                  <td class="p-1 relative">
                    <div class="relative w-[90%]">
                      <div class="bg-gray-800 w-full absolute rounded-sm h-2"></div>
                      <div
                        class="bg-teal-500 rounded-sm relative h-2"
                        style={{
                          "margin-left": `${span.marginLeft}%`,
                          width: `${span.width}%`,
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            }}
          </For>
        </tbody>
      </table>
    </div>
  );
}
