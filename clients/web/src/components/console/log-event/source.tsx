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

  const maybeRelativePath = () =>
    relativePathFromFilePath(props.processedEvent.metadata?.location?.file);

  return (
    <MaybeLinkedSource
      class="ml-auto flex gap-2 items-center text-xs relative"
      maybeRelativePath={maybeRelativePath()}
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
          <Show
            when={maybeRelativePath()}
            fallback={<span>{shortenFilePath(line())}</span>}
          >
            <Tooltip.Root>
              <Tooltip.Trigger>
                <span class="flex justify-items-center">
                  <span class="bg-gray-950/75 p-1 -mt-1 -mb-1 opacity-45 group-hover:opacity-100">
                    <img
                      src="/icons/code.svg"
                      class="w-4 h-4"
                      alt="Jump to code"
                    />
                  </span>
                  <span>{shortenFilePath(line())}</span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content class="z-50">
                  <div class="rounded p-2 border border-slate-500 bg-black shadow z-50">
                    Jump to code: {line()}
                  </div>
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Show>
        )}
      </Show>
    </MaybeLinkedSource>
  );
}
