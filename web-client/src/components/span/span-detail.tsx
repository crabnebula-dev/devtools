import { For, createResource, Show } from "solid-js";
import { useMonitor } from "~/lib/connection/monitor";
import { formatSpansForUi } from "~/lib/span/format-spans-for-ui";
import { getIpcRequestValues } from "~/lib/span/get-ipc-request-value";
import { createHighlighter, getHighlightedCode } from "~/lib/code-highlight";
import { useSearchParams } from "@solidjs/router";
import { processFieldValue } from "~/lib/span/process-field-value";
import { getChildrenList } from "~/lib/span/get-children-list";
import { SpanDetailTrace } from "./span-detail-trace";
import { SpanDetailArgs } from "./span-detail-args";

const ipcSpans = [
  "ipc::request",
  "ipc::request::deserialize_arg",
  "ipc::request::run",
  "ipc::request::respond",
  "ipc::request::response",
  "wry::eval",
];

export function SpanDetail() {
  const [searchParams] = useSearchParams();
  const { monitorData } = useMonitor();
  const spanId = () => BigInt(searchParams.span);
  const span = () => {
    const s = monitorData.spans.find((s) => s.id === spanId());
    if (s) {
      return {
        ...s,
        children: getChildrenList(monitorData.spans, s, (span) =>
          ipcSpans.includes(
            monitorData.metadata.get(span.metadataId)?.name ?? ""
          )
        ),
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
  // filter child only used for metadata (response in this case)
  const children = () =>
    formattedSpan().children.filter((s) => s.name !== "ipc::request::response");

  const responseCode = () => {
    const field = getIpcRequestValues({
      metadata: monitorData.metadata,
      rootSpan: span(),
    })("ipc::request::response")?.fields[0]?.response;
    return field ? processFieldValue(field) : null;
  };

  const args = () =>
    getIpcRequestValues({
      metadata: monitorData.metadata,
      rootSpan: span(),
    })("ipc::request")?.fields.map((f) => processFieldValue(f.request)) ?? [];

  const [responseHtml] = createResource(
    () => [responseCode(), createHighlighter()] as const,
    async ([code, highlighter]) => {
      return code === null
        ? null
        : getHighlightedCode({
            lang: "rust",
            highlighter: await highlighter,
          })(code).replace(
            /\\n/gim, // Turn escaped newlines into actual newlines
            "\n"
          );
    }
  );

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800">
      <div class="pt-4 px-4">
        <h2 class="text-2xl">{formattedSpan()?.name ?? "-"}</h2>
      </div>
      <table>
        <tbody>
          <For each={children()}>
            {(span) => <SpanDetailTrace span={span} />}
          </For>
        </tbody>
      </table>
      <div class="grid gap-2">
        <h2 class="text-xl p-4">Inputs</h2>
        <table>
          <tbody>
            <SpanDetailArgs args={args()} />
          </tbody>
        </table>
      </div>
      <Show when={responseHtml()}>
        {(html) => (
          <div class="grid gap-2">
            <h2 class="text-xl p-4">Response</h2>
            <pre class="bg-black rounded max-w-full overflow-auto">
              <code
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={html()}
              />
            </pre>
          </div>
        )}
      </Show>
    </div>
  );
}
