import { Tooltip } from "@kobalte/core";
import { useConfiguration } from "~/components/tauri/configuration-context";
import SolidMarkdown from "solid-markdown";
import { Show, For, Switch, Match } from "solid-js";
import { getDescriptionByKey } from "~/lib/tauri/tauri-conf-lib";

export function ConfigurationTooltip(props: {
  key: string;
  parentKey: string;
}) {
  const {
    highlightKey: { setHighlightKey },
  } = useConfiguration();

  const key = () =>
    props.parentKey ? props.parentKey + "." + props.key : props.key;

  const localSchema = () => getDescriptionByKey(key());

  const updateHighlightKey = () => {
    setHighlightKey(key());
  };

  return (
    <Show
      when={localSchema()}
      fallback={
        <span class="" onMouseOver={updateHighlightKey}>
          {props.key}
        </span>
      }
    >
      <span class="text-slate-300" onMouseOver={updateHighlightKey}>
        {props.key}
      </span>
      <Tooltip.Root openDelay={0} closeDelay={0}>
        <Tooltip.Trigger>
          <sup class="text-xs text-slate-500 p-1 px-2 rounded hover:text-white cursor-help hover:bg-slate-700 font-bold">
            ?
          </sup>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>
            <Tooltip.Arrow style={{ fill: "rgb(200, 200, 200)" }} />
            <div class="relative overflow-auto max-w-5xl max-h-96 shadow-2xl border border-slate-500 rounded">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <For each={Object.entries(localSchema() ?? {})}>
                      {([key]) => (
                        <th scope="col" class="px-2 py-1">
                          {key}
                        </th>
                      )}
                    </For>
                  </tr>
                </thead>
                <tbody>
                  <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <For each={Object.entries(localSchema() ?? {})}>
                      {([, value]) => (
                        <td class="px-2 py-2 max-w-md align-top">
                          <ToolTipValue value={value} />
                        </td>
                      )}
                    </For>
                  </tr>
                </tbody>
              </table>
            </div>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Show>
  );
}

type ToolTipValue = TooltipRecord | string | [] | boolean;

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
interface TooltipRecord extends Record<string, ToolTipValue> {}

interface ToolTipValueProps {
  value: ToolTipValue;
}

function ToolTipValue(props: ToolTipValueProps) {
  return (
    <Switch fallback={props.value as string}>
      <Match when={typeof props.value === "string"}>
        <StringValue value={props.value as string} />
      </Match>
      <Match when={typeof props.value === "boolean"}>
        <span class="font-mono">
          {(props.value as boolean) ? "true" : "false"}
        </span>
      </Match>
      <Match when={Array.isArray(props.value)}>
        <ArrayValue value={props.value as []} />
      </Match>
      <Match when={typeof props.value === "object" && props.value !== null}>
        <ObjectValue value={props.value as Record<string, ToolTipValue>} />
      </Match>
      <Match when={props.value === null}>Null</Match>
    </Switch>
  );
}

function StringValue(props: { value: string }) {
  return (
    <SolidMarkdown
      class="inline-block prose lg:prose-xl"
      children={props.value}
    />
  );
}

function ArrayValue(props: { value: [] }) {
  return (
    <ul class="list-disc">
      <For each={props.value}>
        {(item) => (
          <li>
            <ToolTipValue value={item} />
          </li>
        )}
      </For>
    </ul>
  );
}

function ObjectValue(props: { value: Record<string, ToolTipValue> }) {
  return (
    <ul class="list-disc">
      <For each={Object.entries(props.value)}>
        {([childKey, objectValue]) => (
          <li>
            <ToolTipValue value={childKey} />:{" "}
            <ToolTipValue value={objectValue} />
          </li>
        )}
      </For>
    </ul>
  );
}
