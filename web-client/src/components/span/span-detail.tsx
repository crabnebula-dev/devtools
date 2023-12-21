import { useMonitor } from "~/context/monitor-provider";
import { Show, createResource } from "solid-js";
import { UiSpan } from "~/lib/span/format-spans-for-ui";
import { SpanDetailView } from "./span-detail-view";
import { getIpcRequestValues } from "~/lib/span/get-ipc-request-value";
import { processFieldValue } from "~/lib/span/process-field-value";
import { spanFieldsToObject } from "~/lib/span/span-fields-to-object";
import { createHighlighter, getHighlightedCode } from "~/lib/code-highlight";
import { getUiSpanChildren } from "~/lib/span/get-ui-span-children";
import { isIpcSpanName } from "~/lib/span/isIpcSpanName";

export function SpanDetail(props: { span: UiSpan }) {
  const { monitorData } = useMonitor();

  const children = () => {
    const allChildren = getUiSpanChildren(props.span);
    if (props.span.kind === "ipc") {
      return allChildren.filter(
        (s) =>
          s.name !== "ipc::request::response" &&
          isIpcSpanName(s.metadataName ?? "")
      );
    }
    return allChildren;
  };

  const valuesSectionTitle = () => {
    switch (props.span.kind) {
      case "ipc":
        return "Inputs";
      case "event":
        return "Args";
      default:
        return "Fields";
    }
  };

  const values = () => {
    switch (props.span.kind) {
      case "ipc": {
        const ipcValues =
          getIpcRequestValues({
            metadata: monitorData.metadata,
            rootSpan: props.span,
          })("ipc::request")
            ?.fields.map((f) => {
              if (f.request) {
                if (f.request.oneofKind === "debugVal") {
                  return { "": f.request.debugVal }
                }
                return processFieldValue(f.request)
              }
              return null
            })
            .filter(Boolean) ?? [];
        return ipcValues;
      }

      default:
        return [spanFieldsToObject(props.span)];
    }
  };

  const code = () => {
    switch (props.span.kind) {
      case "ipc": {
        const field = getIpcRequestValues({
          metadata: monitorData.metadata,
          rootSpan: props.span,
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
      name={props.span.name ?? "-"}
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
