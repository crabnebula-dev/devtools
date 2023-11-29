import { useMonitor } from "~/context/monitor-provider";
import { useSearchParams } from "@solidjs/router";
import { getSpanKind } from "~/lib/span/get-span-kind";
import { Show, createResource } from "solid-js";
import { getChildrenList } from "~/lib/span/get-children-list";
import { isIpcSpanName } from "~/lib/span/isIpcSpanName";
import { FilteredSpan } from "~/lib/span/types";
import { formatSpansForUi } from "~/lib/span/format-spans-for-ui";
import { SpanDetailView } from "./span-detail-view";
import { getIpcRequestValues } from "~/lib/span/get-ipc-request-value";
import { processFieldValue } from "~/lib/span/process-field-value";
import { spanFieldsToObject } from "~/lib/span/span-fields-to-object";
import { createHighlighter, getHighlightedCode } from "~/lib/code-highlight";

export function SpanDetail() {
  const [searchParams] = useSearchParams();
  const { monitorData } = useMonitor();
  const spanId = () => BigInt(searchParams.span);
  const span = () => {
    const s = monitorData.spans.find((s) => s.id === spanId());
    if (s) {
      const kind = getSpanKind({ metadata: monitorData.metadata, span: s });
      const span = { ...s, kind };

      const childrenFilter =
        kind === "ipc"
          ? (span: FilteredSpan) =>
              isIpcSpanName(
                monitorData.metadata.get(span.metadataId)?.name ?? ""
              )
          : undefined;

      return {
        ...span,
        children: getChildrenList(monitorData.spans, s, childrenFilter),
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

  const children = () => {
    if (span().kind === "ipc") {
      return formattedSpan().children.filter(
        (s) => s.name !== "ipc::request::response"
      );
    }
    return formattedSpan().children;
  };

  const valuesSectionTitle = () => {
    switch (span().kind) {
      case "ipc":
        return "Inputs";
      case "event":
        return "Args";
      default:
        return "Fields";
    }
  };

  const values = () => {
    switch (span().kind) {
      case "ipc":
        return (
          getIpcRequestValues({
            metadata: monitorData.metadata,
            rootSpan: span(),
          })("ipc::request")?.fields.map((f) => processFieldValue(f.request)) ??
          []
        );

      default:
        return [spanFieldsToObject(span())];
    }
  };

  const code = () => {
    switch (span().kind) {
      case "ipc": {
        const field = getIpcRequestValues({
          metadata: monitorData.metadata,
          rootSpan: span(),
        })("ipc::request::response")?.fields[0]?.response;
        return field ? processFieldValue(field) : null;
      }

      default:
        return null;
    }
  };

  const [codeHtml] = createResource(
    () => [code(), createHighlighter()] as const,
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
    <SpanDetailView
      name={formattedSpan()?.name ?? "-"}
      spanChildren={children() ?? []}
      valuesSectionTitle={valuesSectionTitle()}
      values={values() ?? []}
    >
      <Show when={codeHtml()}>
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
    </SpanDetailView>
  );
}
