import { Show, For, Switch, Match } from "solid-js";
import { ConfigurationTooltip } from "./configuration-tooltip";
import { getDescriptionByKey } from "~/lib/tauri/tauri-conf-schema";

type ConfigurationValue = ConfigurationRecord | string | [] | boolean;

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
interface ConfigurationRecord extends Record<string, ConfigurationValue> {}

interface ConfigurationValueProps {
  parentKey: string;
  key: string;
  value: ConfigurationValue;
}

interface TextConfigurationValueProps extends ConfigurationValueProps {
  value: string | boolean;
}

interface ArrayConfigurationValueProps extends ConfigurationValueProps {
  value: [];
}

interface ObjectConfigurationValueProps extends ConfigurationValueProps {
  value: ConfigurationRecord;
}

export function ConfigurationValue(props: ConfigurationValueProps) {
  return (
    <Switch
      fallback={<TextValue {...(props as TextConfigurationValueProps)} />}
    >
      <Match
        when={
          typeof props.value === "string" || typeof props.value === "boolean"
        }
      >
        <TextValue {...(props as TextConfigurationValueProps)} />
      </Match>
      <Match when={Array.isArray(props.value)}>
        <ArrayValue {...(props as ArrayConfigurationValueProps)} />
      </Match>
      <Match when={typeof props.value === "object" && props.value !== null}>
        <ObjectValue {...(props as ObjectConfigurationValueProps)} />
      </Match>
    </Switch>
  );
}

function Flags(props: { key: string; value: boolean | string }) {
  const localSchema = () => getDescriptionByKey(props.key);

  const isDefault = () => {
    const schema = localSchema();
    return (
      schema &&
      Object.hasOwn(schema, "default") &&
      schema.default === props.value
    );
  };

  /* TODO implement a check to see if the value is in the config ref: https://linear.app/crabnebula/issue/DR-639/improve-config-parameter-flags */
  const isInConfig = () => {
    return false;
  };

  return (
    <div>
      <Show when={isDefault()}>
        <span class="text-teal-800 pr-2">Default</span>
      </Show>
      <Show when={isInConfig()}>
        <span class="text-teal-800 pr-2">Configured</span>
      </Show>
    </div>
  );
}

function TextValue(props: TextConfigurationValueProps) {
  const key = () =>
    props.parentKey ? props.parentKey + "." + props.key : props.key;

  const value = () =>
    typeof props.value === "boolean"
      ? props.value
        ? "✅"
        : "❌"
      : props.value;

  return (
    <div class="flex text-xl border-1 border-[#4B4B4B] border-2 ">
      <div class="basis-2/5 p-1">
        <ConfigurationTooltip parentKey={props.parentKey} key={props.key} />
      </div>
      <div class="basis-3/5 border-l-2 border-[#4B4B4B] p-1 text-right flex justify-between">
        <Flags key={key()} value={props.value} />
        <span class="ml-auto">{value() as string}</span>
      </div>
    </div>
  );
}

function ObjectValue(props: ObjectConfigurationValueProps) {
  return (
    <div class="p-4 pr-0 group">
      <h2 class="text-3xl pb-2">
        <ConfigurationTooltip parentKey={props.parentKey} key={props.key} />
      </h2>
      <ul class="flex flex-col">
        <For each={Object.entries(props.value)}>
          {([childKey, value]) => (
            <li>
              <ConfigurationValue
                parentKey={props.parentKey + "." + props.key}
                key={childKey}
                value={value}
              />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

function ArrayValue(props: ArrayConfigurationValueProps) {
  return (
    <div class="array">
      <h2 class="text-xl pb-2">
        <ConfigurationTooltip parentKey={props.parentKey} key={props.key} />
      </h2>
      <ul class="flex flex-col">
        <Show
          when={props.value.length > 0}
          fallback={<p class="text-2xl pl-4">- Empty</p>}
        >
          <For each={props.value}>
            {(value, childKey) => (
              <li>
                <ConfigurationValue
                  parentKey={props.parentKey + "." + props.key}
                  key={childKey().toString()}
                  value={value}
                />
              </li>
            )}
          </For>
        </Show>
      </ul>
    </div>
  );
}
