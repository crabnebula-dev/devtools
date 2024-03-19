import { Show, Suspense } from "solid-js";
import { Span } from "~/lib/connection/monitor";
import { CallDetailView } from "./call-detail-view";
import { getIpcRequestValues } from "~/lib/span/get-ipc-request-value";
import { processFieldValue } from "~/lib/span/process-field-value";
import { spanFieldsToObject } from "~/lib/span/span-fields-to-object";
import { getSpanChildren } from "~/lib/span/get-span-children";
import { isIpcSpanName } from "~/lib/span/isIpcSpanName";
import { CodeHighlighter } from "../../code-highlighter";
import { Loader } from "../../loader";

export function CallDetail(props: { span: Span }) {
  const children = () => {
    const allChildren = getSpanChildren(props.span);
    if (props.span.kind === "ipc") {
      // platforms that use webview's postMessage for IPC (such as iOS for remote URLs, Android and Linux)
      // might send the response via an auxiliary custom protocol request, so we filter out those spans
      const channelResponseSpans: bigint[] = [];
      for (const child of allChildren) {
        if (child.parentId && channelResponseSpans.includes(child.parentId)) {
          channelResponseSpans.push(child.id);
        }
        if (child.name === "wry::custom_protocol::handle") {
          channelResponseSpans.push(child.id);
        }
      }
      return allChildren.filter(
        (s) =>
          s.name !== "ipc::request::response" &&
          !channelResponseSpans.includes(s.id) &&
          isIpcSpanName(s.metadata?.name ?? ""),
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
          getIpcRequestValues(props.span)("ipc::request")
            ?.fields.map((f) => {
              if (f.request) {
                if (f.request.oneofKind === "debugVal") {
                  return { "": f.request.debugVal };
                }
                return processFieldValue(f.request);
              }
              return null;
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
        const field = getIpcRequestValues(props.span)("ipc::request::response")
          ?.fields[0]?.response;
        return field
          ? processFieldValue(field).replace(
              /\\n/gim, // Turn escaped newlines into actual newlines
              "\n",
            )
          : null;
      }

      default:
        return null;
    }
  };

  return (
    <CallDetailView
      name={props.span.name ?? "-"}
      hasError={props.span.hasError}
      parentId={props.span.parentId}
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
    </CallDetailView>
  );
}
