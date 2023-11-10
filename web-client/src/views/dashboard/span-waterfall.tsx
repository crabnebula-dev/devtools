import { For, createEffect, createSignal } from "solid-js";
import { useMonitor } from "~/lib/connection/monitor";
import { Toolbar } from "~/components/toolbar";
import { normalizeSpans } from "~/lib/span/normalizeSpans";
import { convertTimestampToNanoseconds } from "~/lib/formatters";

export default function SpanWaterfall() {
  const { monitorData } = useMonitor();
  const [granularity, setGranularity] = createSignal(1);
  const [uiSpans, setUiSpans] = createSignal<ReturnType<typeof normalizeSpans>>(
    []
  );

  const filteredSpans = () =>
    monitorData.spans.filter((s) => {
      const metadata = monitorData.metadata.get(s.metadataId);
      return metadata && metadata.name.includes("ipc");
    });

  createEffect(() => {
    setUiSpans(
      normalizeSpans(
        filteredSpans()
          .map((span) => {
            if (!span.enteredAt || !span.exitedAt) {
              return { end: -1, start: -1 };
            }
            return {
              start: convertTimestampToNanoseconds(span.enteredAt),
              end: convertTimestampToNanoseconds(span.exitedAt),
            };
          })
          .filter((span) => span.start !== -1 && span.end !== -1),
        granularity() * 1000
      )
    );
  });

  return (
    <div>
      <Toolbar>
        <input
          oninput={(e) => setGranularity(parseFloat(e.target.value))}
          type="range"
          min="1"
          max={5}
          value={granularity()}
        />
      </Toolbar>
      <ul class="w-full overflow-auto h-[calc(100vh-114px)]">
        <For each={filteredSpans()}>
          {(span, i) => {
            const metadata = monitorData.metadata.get(span.metadataId);

            return (
              <li class="py-1 flex">
                <div
                  data-tooltip={`Took ${
                    (convertTimestampToNanoseconds(span.exitedAt!) -
                      convertTimestampToNanoseconds(span.enteredAt!)) /
                    1e6
                  }ms`}
                  class="span relative transition-all text-xs p-1 overflow-ellipsis text-white bg-primary-800 rounded"
                  style={{
                    width: `${uiSpans()[i()]?.normalizedWidth}%`,
                    "margin-left": `${uiSpans()[i()]?.normalizedStart}%`,
                  }}
                >
                  {metadata?.name}
                </div>
              </li>
            );
          }}
        </For>
      </ul>
    </div>
  );
}
