import { Show, For, Switch, Match } from "solid-js";
import { ConfigurationTooltip } from "./configuration-tooltip";

type ConfigurationValueProps = {
  parentKey: string;
  key: string;
  value: any;
};

function ConfigurationText(props: ConfigurationValueProps) {
  return (
    <div class="flex text-xl border-1 border-[#4B4B4B] border-2 ">
      <div class="basis-2/5 p-1">
        <ConfigurationTooltip parentKey={props.parentKey} key={props.key} />
      </div>
      <div class="basis-3/5 border-l-2 border-[#4B4B4B] p-1 text-right">
        <p>{props.value}</p>
      </div>
    </div>
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
      </Match>
      <Match when={typeof props.value === "object" && props.value !== null}>
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
      </Match>
    </Switch>
  );
}
