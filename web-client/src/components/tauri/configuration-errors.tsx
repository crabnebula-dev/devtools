import { ZodError, ZodIssueBase, ZodUnrecognizedKeysIssue } from "zod";
import { TauriConfig } from "~/lib/tauri/config/tauri-conf";
import { Show, For } from "solid-js";
import { useConfiguration } from "./configuration-context";

export function ConfigurationErrors(props: {
  error: ZodError<TauriConfig> | undefined;
}) {
  const {
    highlightKey: { setHighlightKey },
  } = useConfiguration();

  const updateHighlightKey = (key: string, event: any) => {
    setHighlightKey(key);
  };
  return (
    <Show
      when={props.error}
      fallback={
        <h1 class="text-2xl text-lime-900">
          ✅ This configuration does not have errors ✅
        </h1>
      }
    >
      <h1 class="text-2xl text-red-900">⚠ This configuration has errors ⚠</h1>
      <For each={props.error!.errors}>
        {(item) => (
          <>
            <h2
              class="text-xl font-bold cursor-pointer"
              onMouseOver={[updateHighlightKey, buildHighlightKey(item)]}
            >
              <For each={item.path}>{(path) => <span>[{path}]</span>}</For>
              <Show when={isUnrecognizedKeyIssue(item)}>
                <For each={item.keys!}>{(key) => <span>[{key}]</span>}</For>
              </Show>
            </h2>
            <p>{item.message}</p>
          </>
        )}
      </For>
    </Show>
  );
}

function buildHighlightKey(issue: ZodIssueBase) {
  let key = issue.path.join(".");
  if (isUnrecognizedKeyIssue(issue))
    key += key === "" ? issue.keys[0] : "." + issue.keys[0];
  return key;
}

function isUnrecognizedKeyIssue(
  value: ZodIssueBase
): value is ZodUnrecognizedKeysIssue {
  return "keys" in value;
}
