import { Show, For, createMemo } from "solid-js";
import { ConfigurationTooltip } from "./configuration-tooltip";
import { Flags } from "./configuration-value/flags";
import { TauriConfig } from "~/lib/tauri/config/tauri-conf";

type ConfigurationValue = TauriConfig[keyof TauriConfig];

interface ConfigurationValueProps {
  parentKey: string;
  key: string;
  value: ConfigurationValue;
}

type TextConfigurationValueProps = Omit<ConfigurationValueProps, "value"> & {
  value: string | boolean;
};

interface ArrayConfigurationValueProps extends ConfigurationValueProps {
  value: ConfigurationValue[];
}

interface ObjectConfigurationValueProps extends ConfigurationValueProps {
  value: Omit<ConfigurationValue, "undefined">;
}

export function ConfigurationValue(props: ConfigurationValueProps) {
  const selectedTemplate = createMemo(() => {
    if (typeof props.value === "string" || typeof props.value === "boolean")
      return <TextValue {...props} value={props.value} />;

    if (Array.isArray(props.value))
      return <ArrayValue {...props} value={props.value} />;

    if (typeof props.value === "object" && props.value)
      return <ObjectValue {...props} value={props.value} />;

    return <TextValue {...props} value={String(props.value)} />;
  });

  return <>{selectedTemplate()}</>;
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
    <div class="flex text-base border-t border-slate-800">
      <div class="basis-3/5 py-2 pl-3 text-right flex justify-between">
        <ConfigurationTooltip parentKey={props.parentKey} key={props.key} />
      </div>
      <div class="mr-2 flex pt-3">
        <Flags key={key()} value={props.value} />
      </div>
      <div class="basis-2/5 flex px-4 bg-slate-950 border-l border-slate-800">
        <span class="font-bold w-full h-full flex items-center">{value()}</span>
      </div>
    </div>
  );
}

function ObjectValue(props: ObjectConfigurationValueProps) {
  return (
    <div class="">
      <h2 class="text-1xl text-white font-bold py-2 px-3 bg-slate-700 bg-opacity-30 flex justify-between">
        <ConfigurationTooltip parentKey={props.parentKey} key={props.key} />
      </h2>
      <ul class="flex flex-col">
        <For each={Object.entries<ConfigurationValue>(props.value)}>
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
      <h2 class="text-2xl text-white font-bold py-2 px-3 bg-slate-700 bg-opacity-50 flex justify-between">
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
