import { For, Show } from "solid-js";
import { useMonitor } from "~/lib/connection/monitor";
import { formatSpansForUi } from "~/lib/span/format-spans-for-ui";
import { processFieldValue } from "~/lib/span/process-field-value";
import { getEventPayload } from "~/lib/span/get-event-payload";
import { getChildrenList } from "~/lib/span/get-children-list";
import { SpanDetailTrace } from "./span-detail-trace";
import { SpanDetailArgs } from "./span-detail-args";
import { SpanKind } from "~/lib/span/types";
import { spanFieldsToObject } from "~/lib/span/span-fields-to-object";

type Props = {
  spanId: bigint;
};

export function EventSpanDetail(props: Props) {
  const { monitorData } = useMonitor();
  const span = () => {
    const s = monitorData.spans.find((s) => s.id === props.spanId);
    if (s) {
      const span = { ...s, kind: "event" as SpanKind };
      return {
        ...span,
        children: getChildrenList(monitorData.spans, span),
      };
    }
    throw new Error("No Span");
  };

  const formattedSpan = () =>
    formatSpansForUi({
      allSpans: monitorData.spans,
      spans: [span()],
      metadata: monitorData.metadata,
    })[0];

  const args = () => spanFieldsToObject(span());

  const payload = () => {
    const eventPayload = getEventPayload({
      metadata: monitorData.metadata,
      rootSpan: span(),
    })("window::emit")?.fields.map((f) =>
      f.payload ? processFieldValue(f.payload) : ""
    )[0];
    return eventPayload ? [{ payload: eventPayload }] : [];
  };

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800">
      <div class="pt-4 px-4">
        <h2 class="text-2xl">{formattedSpan()?.name ?? "-"}</h2>
        <Show when={args().label}>
          {(label) => <h3>Target: {processFieldValue(label())}</h3>}
        </Show>
      </div>
      <table>
        <tbody>
          <For each={formattedSpan().children ?? []}>
            {(span) => <SpanDetailTrace span={span} />}
          </For>
        </tbody>
      </table>
      <div class="grid gap-2">
        <h2 class="text-xl p-4">Payload</h2>
        <table>
          <tbody>
            <SpanDetailArgs args={payload()} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
