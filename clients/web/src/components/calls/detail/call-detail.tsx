import { For, Show, Suspense, createMemo, createSignal } from "solid-js";
import { Span } from "~/lib/connection/monitor";
import { CallDetailView } from "./call-detail-view";
import { spanFieldsToObject } from "~/lib/span/span-fields-to-object";
import { treeEntries } from "~/lib/span/get-span-children";
import { CodeHighlighter } from "../../code-highlighter";
import { Loader } from "../../loader";
import { Metadata_Level } from "~/lib/proto/common";
import { useMonitor } from "~/context/monitor-provider";
import { LogEventEntry } from "~/components/console/log-event-entry";

export function CallDetail(props: { span: Span }) {
  const { monitorData } = useMonitor();

  const [minLevel, setMinLevel] = createSignal<Metadata_Level>(
    Metadata_Level.TRACE,
  );

  const root = createMemo(() => {
    // If our current span is a root span, don't recurse up.
    if (!props.span.parent) return;

    // Walk up, with a limit on number of hops.
    let node = props.span;
    for (let limit = 10; limit && node.parent; limit--) {
      node = node.parent;
    }
    return node;
  });

  const children = createMemo(() => {
    const level = minLevel();
    return treeEntries(
      props.span,
      (span) => span.metadata && span.metadata.level <= level,
    );
  });

  const includedSpans = createMemo(
    () => new Set(children().map((n) => n.span.id)),
  );

  const associatedLogs = createMemo(() => {
    const spanIds = includedSpans();
    return monitorData.logs.filter(
      (log) => log.parent && spanIds.has(log.parent),
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
      rootSpanId={root()?.id}
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
      <Show when={associatedLogs().length}>
        <div class="grid gap-2 border-gray-800 border-b">
          <h2 class="text-xl p-4 border-gray-800 border-b">
            Logs ({associatedLogs().length})
          </h2>
          <For each={associatedLogs()}>
            {(log, idx) => (
              <LogEventEntry
                event={log}
                showAttributes={true}
                showTimestamp={true}
                odd={idx() % 2 == 0}
              />
            )}
          </For>
        </div>
      </Show>
    </CallDetailView>
  );
}
