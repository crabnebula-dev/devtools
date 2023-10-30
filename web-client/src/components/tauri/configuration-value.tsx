import { Show, For, Switch, Match } from "solid-js";
import { Tooltip } from "@kobalte/core";

type ConfigurationValueProps = {
  parentKey: string;
  key: string;
  value: any;
  description: object;
};

function ConfigurationText(props: ConfigurationValueProps) {
  return (
    <p class="text-2xl py-2">
      <ConfigurationTooltip
        parentKey={props.parentKey}
        key={props.key}
        value={props.value}
        description={props.description}
      />{" "}
      : {props.value}
    </p>
  );
}

function ConfigurationTooltip(props: {
  parentKey: string;
  key: string;
  value?: any;
  description: object;
}) {
  /**
  const { monitorData } = useMonitor();
  const schema = monitorData.schema;
  const data = monitorData.tauriConfig!;

  const configSchema = retrieveJsonSchemaForKey(
    data,
    props.parentKey + "." + props.key,
    schema
  );
  */
  let description = "";

  /**
  const { monitorData } = useMonitor();
  let topLevelScheme = monitorData.schema!.definitions;
  console.log("Top level scheme", topLevelScheme);
  const key = props.parentKey + "." + props.key;

  let fieldDescription = findFieldDefinitionByKeyInScheme(key, topLevelScheme);

  const description = fieldDescription.description;

  console.log(fieldDescription);
  */
  return (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <span class="hover:bg-gray-900 rounded p-2">
          {props.key}
          <sup class="text-sm">❔</sup>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          class={
            "bg-gray-900 text-xl font-medium text-white p-2 border-solid border border-gray-700"
          }
        >
          <Tooltip.Arrow />
          <p>{description}</p>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function ConfigurationValue(props: ConfigurationValueProps) {
  return (
    <Switch
      fallback={
        <ConfigurationText
          parentKey={props.parentKey}
          key={props.key}
          value={props.value}
        />
      }
    >
      <Match when={typeof props.value === "string"}>
        <ConfigurationText
          parentKey={props.parentKey}
          key={props.key}
          value={props.value}
        />
      </Match>
      <Match when={typeof props.value === "boolean"}>
        <ConfigurationText
          parentKey={props.parentKey}
          key={props.key}
          value={props.value ? "✅" : "❌"}
        />
      </Match>
      <Match when={Array.isArray(props.value)}>
        <div class="p-4">
          <div class="p-2 border-l array">
            <h2 class="text-3xl">
              <ConfigurationTooltip
                parentKey={props.parentKey}
                key={props.key}
                value={props.value}
              />
              :{" "}
            </h2>
            <ul class="pl-2 flex flex-col gap-3">
              <Show
                when={props.value.length > 0}
                fallback={<p class="text-2xl py-2">- Empty</p>}
              >
                <For each={props.value}>
                  {(value, childKey) => (
                    <li class="p-1">
                      <ConfigurationValue
                        parentKey={props.parentKey + "/" + props.key}
                        key={childKey().toString()}
                        value={value}
                      />
                    </li>
                  )}
                </For>
              </Show>
            </ul>
          </div>
        </div>
      </Match>
      <Match when={typeof props.value === "object" && props.value !== null}>
        <div class="p-4">
          <div class="p-2 border-l group">
            <h2 class="text-3xl">
              <ConfigurationTooltip
                parentKey={props.parentKey}
                key={props.key}
                value={props.value}
              />
            </h2>
            <ul class="pl-2 flex flex-col gap-3">
              <For each={Object.entries(props.value)}>
                {([childKey, value]) => (
                  <li>
                    <ConfigurationValue
                      parentKey={props.parentKey + "/" + props.key}
                      key={childKey}
                      value={value}
                    />
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </Match>
    </Switch>
  );
}
