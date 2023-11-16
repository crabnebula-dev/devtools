import { Tooltip } from "@kobalte/core";
import { useConfiguration } from "~/components/tauri/configuration-context";
import SolidMarkdown from "solid-markdown";
import { Show, For, Switch, Match } from "solid-js";
import { getDescriptionByKey } from "~/lib/tauri/tauri-conf-schema";

export function ConfigurationTooltip(props: {
  key: string;
  parentKey: string;
}) {
  const {
    highlightKey: { setHighlightKey },
  } = useConfiguration();

  const key = () =>
    props.parentKey !== "" ? props.parentKey + "." + props.key : props.key;

  const localSchema = () => getDescriptionByKey(key());

  const updateHighlightKey = () => {
    setHighlightKey(key());
  };

  return (
    <Show
      when={localSchema()}
      fallback={
        <span
          class="hover:bg-gray-900 rounded"
          onMouseOver={updateHighlightKey}
        >
          {props.key}
        </span>
      }
    >
      <Tooltip.Root openDelay={500} closeDelay={500}>
        <Tooltip.Trigger>
          <span
            class="hover:bg-gray-900 rounded"
            onMouseOver={updateHighlightKey}
          >
            {props.key}
            <sup class="text-sm">❔</sup>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content class="bg-gray-900 text-xl font-medium text-white border-solid border border-gray-700">
            <Tooltip.Arrow />
            <div class="relative overflow-auto max-w-5xl max-h-96">
              <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <For each={Object.entries(localSchema() ?? {})}>
                      {([key]) => (
                        <th scope="col" class="px-6 py-3">
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
                        <td class="px-6 py-4 max-w-md align-top">
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
        {(props.value as boolean) ? "✅" : "❌"}
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
      children={props.value as string}
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
