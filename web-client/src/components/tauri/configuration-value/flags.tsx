import { Show } from "solid-js";
import {
  getDescriptionByKey,
  findLineNumberByKey,
} from "~/lib/tauri/tauri-conf-schema";

export function Flags(props: { key: string; value: boolean | string }) {
  const localSchema = () => getDescriptionByKey(props.key);

  const isInConfig = () => {
    const lineNumber = findLineNumberByKey(props.key);
    return lineNumber > 0;
  };
  return (
    <div>
      <Show when={isDefaultValue(localSchema(), props.value)}>
        <span class="text-teal-800 pr-2">Default</span>
      </Show>
      <Show when={isInConfig()}>
        <span class="text-yellow-500 pr-2">In Config</span>
      </Show>
    </div>
  );
}

export function isDefaultValue(
  schema:
    | {
        default?: string;
        enum?: string[];
      }
    | undefined,
  value: boolean | null | string
) {
  if (!schema) return false;

  if (Object.hasOwn(schema, "default") && schema.default === value) return true;

  console.log(schema, value);
  if ((!Object.hasOwn(schema, "default") && value === null) || value === "")
    return true;

  if ("enum" in schema && schema.enum && schema.enum[0] === value) return true;

  return false;
}
