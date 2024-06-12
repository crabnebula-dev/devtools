import type { ProcessedLogEvent } from "~/lib/console/process-log-event-for-view";
import { Show, createMemo } from "solid-js";
import { shortenFilePath } from "~/lib/formatters";
import { Tooltip } from "@kobalte/core";
import { getFileLineFromLocation } from "~/lib/console/get-file-line-from-location";
import { MaybeLinkedSource } from "./maybe-linked-source";
import { useMonitor } from "~/context/monitor-provider";
import { relativePathFromFilePath } from "~/lib/console/relative-path-from-file-path";

export function Source(props: { processedEvent: ProcessedLogEvent }) {
  const { monitorData } = useMonitor();

  const parentSpanName = createMemo(() => {
    const parentSpanId = props.processedEvent.parent;
    if (!parentSpanId) return;

    const parentSpan = monitorData.spans.get(parentSpanId);
    if (!parentSpan) return;

    const rootSpan = parentSpan.rootSpan;
    if (rootSpan) return rootSpan.displayName ?? rootSpan.name;

    return parentSpan.displayName ?? parentSpan.name;
  });

  return (
    <MaybeLinkedSource
      class="ml-auto flex gap-2 items-center text-xs relative"
      maybeRelativePath={relativePathFromFilePath(
        props.processedEvent.metadata?.location?.file,
      )}
      lineNumber={props.processedEvent.metadata?.location?.line}
    >
      <Show when={props.processedEvent.target}>
        {(logTarget) => (
          <span class="text-slate-400 group-hover:text-slate-100 transition-colors">
            {logTarget()}
          </span>
        )}
      </Show>
      <Show when={parentSpanName()}>
        {(spanName) => (
          <span class="group-hover:text-slate-100 transition-colors">
            {spanName()}
          </span>
        )}
      </Show>
      <Show
        when={getFileLineFromLocation(props.processedEvent.metadata?.location)}
      >
        {(line) => (
          <Tooltip.Root>
            <Tooltip.Trigger>
              <span>
                <span class="flex flex-row absolute bg-gray-950/50 right-[-0.25rem] -top-4 z-40 p-1 opacity-45 group-hover:opacity-100">
                  <img
                    src="/icons/code.svg"
                    width="16"
                    height="16"
                    class=""
                    alt="Jump to code"
                  />
                </span>
                {shortenFilePath(line())}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content class="z-50">
              <div class="rounded p-2 border border-slate-500 bg-black shadow">
                Jump to code: {line()}
              </div>
            </Tooltip.Content>
          </Tooltip.Root>
        )}
      </Show>
    </MaybeLinkedSource>
  );
}
