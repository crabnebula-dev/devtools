import { Show, Suspense, createMemo, createSignal } from "solid-js";
import { Span } from "~/lib/connection/monitor";
import { CallDetailView } from "./call-detail-view";
import { spanFieldsToObject } from "~/lib/span/span-fields-to-object";
import { treeEntries } from "~/lib/span/get-span-children";
import { CodeHighlighter } from "../../code-highlighter";
import { Loader } from "../../loader";
import { Metadata_Level } from "~/lib/proto/common";

export function CallDetail(props: { span: Span }) {
  const [minLevel, setMinLevel] = createSignal<Metadata_Level>(
    Metadata_Level.TRACE,
  );

  const children = createMemo(() => {
    const level = minLevel();
    return treeEntries(
      props.span,
      (span) => span.metadata && span.metadata.level <= level,
    );
  });

  const valuesSectionTitle = () => {
    if (props.span.ipcData?.inputs) {
      return "Inputs";
    }

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
    return [props.span.ipcData?.inputs ?? spanFieldsToObject(props.span)];
  };

  return (
    <CallDetailView
      name={props.span.displayName ?? props.span.name ?? "-"}
      minLevel={minLevel()}
      setMinLevel={setMinLevel}
      hasError={props.span.hasError}
      parentId={props.span.parentId}
      spanChildren={children()}
      valuesSectionTitle={valuesSectionTitle()}
      values={values()}
    >
      <Show when={props.span.ipcData?.response}>
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
