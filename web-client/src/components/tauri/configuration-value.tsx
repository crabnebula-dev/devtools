import { Show, For, Switch, Match } from "solid-js";
import { ConfigurationTooltip } from "./configuration-tooltip";

type ConfigurationValueProps = {
  parentKey: string;
  key: string;
  value: any;
};

function ConfigurationText(props: ConfigurationValueProps) {
  return (
    <p class="text-2xl py-2">
      <ConfigurationTooltip parentKey={props.parentKey} key={props.key} /> :{" "}
      {props.value}
    </p>
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
        </div>
      </Match>
      <Match when={typeof props.value === "object" && props.value !== null}>
        <div class="p-4">
          <div class="p-2 border-l group">
            <h2 class="text-3xl">
              <ConfigurationTooltip
                parentKey={props.parentKey}
                key={props.key}
              />
            </h2>
            <ul class="pl-2 flex flex-col gap-3">
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
        </div>
      </Match>
    </Switch>
  );
}
