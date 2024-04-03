import type { ProcessedLogEvent } from "~/lib/console/process-log-event-for-view";
import { Show, createMemo } from "solid-js";
import { shortenFilePath } from "~/lib/formatters";
import { Tooltip } from "@kobalte/core";
import { getFileLineFromLocation } from "~/lib/console/get-file-line-from-location";
import { useConnection } from "~/context/connection-provider";
import { MaybeLinkedSource } from "./maybe-linked-source";

export function Source(props: { processedEvent: ProcessedLogEvent }) {
  const {
    connectionStore: { host, port },
  } = useConnection();

  const maybeRelativePath = createMemo(() => {
    const file = props.processedEvent.metadata?.location?.file;
    if (!file) return;
    // Only relative paths work.
    // HACK: assume all tauri apps use `src/**/*.rs`
    if (file.startsWith("src/")) {
      return `./${file}`;
    }
    if (file.startsWith("./src/")) {
      return file;
    }
  });

  return (
    <MaybeLinkedSource
      class="ml-auto flex gap-2 items-center text-xs"
      baseSources={`/dash/${host}/${port}/sources/`}
      maybeRelativePath={maybeRelativePath()}
    >
      <Show when={props.processedEvent.target}>
        {(logTarget) => (
          <span class="text-slate-400 group-hover:text-slate-100 transition-colors">
            {logTarget()}
          </span>
        )}
      </Show>
      <Show
        when={getFileLineFromLocation(props.processedEvent.metadata?.location)}
      >
        {(line) => (
          <Tooltip.Root>
            <Tooltip.Trigger>
              <span>{shortenFilePath(line())}</span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <div class="rounded p-2 border border-slate-500 bg-black shadow">
                {line()}
              </div>
            </Tooltip.Content>
          </Tooltip.Root>
        )}
      </Show>
    </MaybeLinkedSource>
  );
}
