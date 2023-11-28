import { ZodError, ZodIssueBase, ZodUnrecognizedKeysIssue } from "zod";
import { TauriConfig } from "~/lib/tauri/config/tauri-conf";
import { Show, For } from "solid-js";
import { useConfiguration } from "./configuration-context";
import {
  UnrecognizedKeyIssue,
  isUnrecognizedKeyIssue,
} from "./errors/unrecognized-key-issue";
import { findLineNumberByKey } from "~/lib/tauri/tauri-conf-schema";

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
        <h2 class="text-2xl pt-2 text-lime-900">
          ✅ This configuration is valid ✅
        </h2>
      }
    >
      <h2 class="text-2xl pt-2 text-red-900">
        ⚠ This configuration has errors ⚠
      </h2>
      <For each={props.error?.errors}>
        {(item) => (
          <section class="py-4">
            <p class="text-red-500 text-2xl">Error: {item.message} :</p>
            <h2
              class="text-xl font-bold cursor-pointer"
              onMouseOver={[
                updateHighlightKey,
                buildHighlightKeyForIssue(item),
              ]}
            >
              <Show
                when={findLineNumberByKey(buildHighlightKeyForIssue(item)) > 0}
              >
                Line: {findLineNumberByKey(buildHighlightKeyForIssue(item))}
                {" : "}
              </Show>
              <For each={item.path}>{(path) => <span>[{path}]</span>}</For>
              <UnrecognizedKeyIssue issue={item} />
            </h2>
          </section>
        )}
      </For>
    </Show>
  );
}

function buildHighlightKeyForIssue(issue: ZodIssueBase) {
  let key = issue.path.join(".");
  if (isUnrecognizedKeyIssue(issue))
    key += key === "" ? issue.keys[0] : "." + issue.keys[0];
  return key;
}
