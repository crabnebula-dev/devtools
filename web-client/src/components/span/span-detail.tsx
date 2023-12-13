import { useMonitor } from "~/context/monitor-provider";
import { Show, Suspense } from "solid-js";
import { Loader } from "../loader";
import { UiSpan } from "~/lib/span/format-spans-for-ui";
import { SpanDetailView } from "./span-detail-view";
import { getIpcRequestValues } from "~/lib/span/get-ipc-request-value";
import { processFieldValue } from "~/lib/span/process-field-value";
import { spanFieldsToObject } from "~/lib/span/span-fields-to-object";
import { getUiSpanChildren } from "~/lib/span/get-ui-span-children";
import { isIpcSpanName } from "~/lib/span/isIpcSpanName";
import { CodeHighlighter } from "../code-higlighter";

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
          })("ipc::request")?.fields.map((f) => processFieldValue(f.request)) ??
          [];
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

  return (
    <SpanDetailView
      name={props.span.name ?? "-"}
      spanChildren={children() ?? []}
      valuesSectionTitle={valuesSectionTitle()}
      values={values() ?? []}
    >
      <Show when={code()}>
        {(raw) => (
          <div class="grid gap-2">
            <h2 class="text-xl p-4">Response</h2>
            <pre class="bg-black rounded max-w-full overflow-auto">
              <Suspense fallback={<Loader />}>
                <CodeHighlighter text={raw()} lang="rust" />
              </Suspense>
            </pre>
          </div>
        )}
      </Show>
    </SpanDetailView>
  );
}
