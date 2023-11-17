import { For, createResource, Show } from "solid-js";
import { useMonitor } from "~/lib/connection/monitor";
import { formatSpansForUi } from "~/lib/span/formatSpansForUi";
import { getIpcRequestValues } from "~/lib/span/getIpcRequestValue";
import { createHighlighter, getHighlightedCode } from "~/lib/code-highlight";
import { useSearchParams } from "@solidjs/router";
import { processFieldValue } from "~/lib/span/processFieldValue";
import { getChildrenList } from "~/lib/span/getChildrenList";

export function SpanDetail() {
  const [searchParams] = useSearchParams();
  const { monitorData } = useMonitor();
  const spanId = () => BigInt(searchParams.span);
  const span = () => {
    const s = monitorData.spans.find((s) => s.id === spanId());
    if (s) {
      return { ...s, children: getChildrenList(monitorData.spans, s) };
    }
    return null;
  };
  const formattedSpan = () =>
    formatSpansForUi({
      allSpans: monitorData.spans,
      spans: [span()!],
      metadata: monitorData.metadata,
    })[0];

  const responseCode = () => {
    const field = getIpcRequestValues({
      metadata: monitorData.metadata,
      rootSpan: span()!,
    })("ipc::request::response")?.fields[0]?.response;
    return field ? processFieldValue(field) : null;
  };

  const args = () =>
    getIpcRequestValues({
      metadata: monitorData.metadata,
      rootSpan: span()!,
    })("ipc::request")!.fields.map((f) => processFieldValue(f.request));

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
          <For each={formattedSpan().children ?? []}>
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
        <h2 class="text-xl p-4">Inputs</h2>
        <table>
          <tbody>
            <For each={args()}>
              {(arg) => {
                return (
                  <For each={Object.entries(JSON.parse(arg))}>
                    {([k, v]) => (
                      <Show
                        when={
                          ![
                            "cmd",
                            "callback",
                            "error",
                            "__tauriModule",
                          ].includes(k)
                        }
                      >
                        <tr class="even:bg-[#ffffff09]">
                          <td class="py-1 px-4 font-bold">{k}</td>
                          <td class="py-1 px-4">
                            {typeof v === "object"
                              ? JSON.stringify(v)
                              : String(v)}
                          </td>
                        </tr>
                      </Show>
                    )}
                  </For>
                );
              }}
            </For>
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
