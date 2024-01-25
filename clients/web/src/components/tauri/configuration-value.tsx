import { Show, For, Switch, Match } from "solid-js";
import { ConfigurationTooltip } from "./configuration-tooltip";
import { Flags } from "./configuration-value/flags";

type ConfigurationValue =
  | ConfigurationRecord
  | string
  | []
  | boolean
  | null
  | undefined
  | unknown;

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

function TextValue(props: TextConfigurationValueProps) {
  const key = () =>
    props.parentKey ? props.parentKey + "." + props.key : props.key;

  const value = () =>
    typeof props.value === "boolean" ? (
      <span class="font-mono">{String(props.value)}</span>
    ) : (
      props.value
    );
  return (
    <div class="flex text-xl hover:bg-slate-800">
      <div class="basis-2/5 p-1">
        <ConfigurationTooltip parentKey={props.parentKey} key={props.key} />
      </div>
      <div class="basis-3/5 p-1 text-right flex justify-between">
        <span class="ml-auto">{value()}</span>
        <Flags key={key()} value={props.value} />
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
        <Show when={props.value.length > 0}>
          <For each={props.value}>
            {(value, childKey) => (
              <li>
                <ConfigurationValue
                  key={String(childKey())}
                  parentKey={props.parentKey + "." + props.key}
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
