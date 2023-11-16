import { Show, For, Switch, Match } from "solid-js";
import { ConfigurationTooltip } from "./configuration-tooltip";

interface ConfigurationValueProps {
  parentKey: string;
  key: string;
  value: object | string | [] | boolean;
}

interface ArrayConfigurationValueProps extends ConfigurationValueProps {
  value: [];
}

interface ObjectConfigurationValueProps extends ConfigurationValueProps {
  value: object;
}

export function ConfigurationValue(props: ConfigurationValueProps) {
  return (
    <Switch fallback={<TextValue {...props} />}>
      <Match when={typeof props.value === "string"}>
        <TextValue {...props} />
      </Match>
      <Match when={typeof props.value === "boolean"}>
        <TextValue {...{ ...props, value: props.value ? "✅" : "❌" }} />
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

function TextValue(props: ConfigurationValueProps) {
  return (
    <div class="flex text-xl border-1 border-[#4B4B4B] border-2 ">
      <div class="basis-2/5 p-1">
        <ConfigurationTooltip parentKey={props.parentKey} key={props.key} />
      </div>
      <div class="basis-3/5 border-l-2 border-[#4B4B4B] p-1 text-right">
        <p>{props.value as string}</p>
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
