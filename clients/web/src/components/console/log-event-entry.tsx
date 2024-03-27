import { JSXElement, Show, createMemo } from "solid-js";
import { formatTimestamp } from "~/lib/formatters";
import type { LogEvent } from "~/lib/proto/logs";
import clsx from "clsx";
import { getFileLineFromLocation } from "~/lib/console/get-file-line-from-location";
import { processLogEventForView } from "~/lib/console/process-log-event-for-view";
import { Field } from "~/lib/proto/common";
import { processFieldValue } from "~/lib/span/process-field-value";
import { A, useParams } from "@solidjs/router";
import { encodeFileName } from "~/lib/sources/file-entries";

import MigrateAlt from "../icons/migrate--alt";
import { Tooltip } from "@kobalte/core";

function displayField(field: Field) {
  // HACK: overflow isn't handled nicely right now.
  const maxLen = 180;
  const fullStrVal = processFieldValue(field.value);
  let strVal = fullStrVal;
  if (strVal.length > maxLen) {
    strVal = strVal.substring(0, maxLen) + "…";
  }

  return (
    <span class="group-hover:text-slate-300 text-slate-500 transition-colors hackathon">
      <span class="fname">{field.name}</span>
      <span class="fequal"> = </span>
      <span
        class="fval group-hover:text-slate-100 text-slate-300 transition-colors"
        title={fullStrVal}
      >
        {strVal}
      </span>
    </span>
  );
}

export function LogEventEntry(props: {
  event: LogEvent;
  showLinks?: boolean;
  showAttributes?: boolean;
  showTimestamp?: boolean;
  odd?: boolean;
}) {
  const { host, port } = useParams();

  const maybeRelativePath = createMemo(() => {
    const loc = processLogEventForView(props.event)?.metadata?.location;
    if (!loc) return;

    const file = loc.file;
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
    <Show when={processLogEventForView(props.event)}>
      {(processedEvent) => (
        <div
          class={clsx(
            "p-1  font-mono text-sm items-center flex gap-8 group",
            processedEvent().levelStyle
              ? processedEvent().levelStyle
              : "border-b-gray-800 text-white",
            props.odd ? "" : "bg-slate-900",
          )}
        >
          <Show when={props.showTimestamp}>
            <time
              dateTime={processedEvent().timeDate.toISOString()}
              class={clsx(
                processedEvent().levelStyle
                  ? processedEvent().levelStyle
                  : "text-slate-400 group-hover:text-slate-100",
                "font-mono text-xs transition-colors",
              )}
            >
              {formatTimestamp(processedEvent().timeDate)}
            </time>
          </Show>
          <Show when={processedEvent().message.length}>
            <span class="group-hover:text-white text-slate-300 transition-colors relative">
              <Show when={props.showLinks && processedEvent().parent}>
                <A
                  href={`/dash/${host}/${port}/calls?span=${processedEvent().parent}`}
                  class="text-slate-400 group-hover:text-white absolute -left-6 top-1/2 -translate-y-1/2"
                >
                  <span class="size-4 hover:scale-125 inline-block">
                    <MigrateAlt />
                  </span>
                </A>
              </Show>
              {processedEvent().message}
            </span>
          </Show>
          <Show when={props.showAttributes}>
            {processedEvent().fields.map(displayField)}
          </Show>
          <MaybeLinkedSource
            class="ml-auto flex gap-2 items-center text-xs"
            baseSources={`/dash/${host}/${port}/sources/`}
            maybeRelativePath={maybeRelativePath()}
          >
            <Show when={processedEvent().target}>
              {(logTarget) => (
                <span class="text-slate-400 group-hover:text-slate-100 transition-colors">
                  {logTarget()}
                </span>
              )}
            </Show>
            <Show
              when={getFileLineFromLocation(
                processedEvent().metadata?.location,
              )}
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
        </div>
      )}
    </Show>
  );
}

function shortenFilePath(fullPath: string): string {
  return JSON.stringify(fullPath ?? "")
    .split("\\")
    .pop()
    .replace(/"$/, "");
}

function MaybeLinkedSource(props: {
  baseSources: string;
  maybeRelativePath?: string;
  class: string;
  children: JSXElement;
}) {
  return (
    <Show
      when={props.maybeRelativePath}
      fallback={<span class={props.class}>{props.children}</span>}
    >
      {(path) => (
        <A
          href={props.baseSources + encodeFileName(path())}
          class={props.class}
        >
          {props.children}
        </A>
      )}
    </Show>
  );
}
