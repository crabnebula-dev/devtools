import { ZodIssueBase, ZodUnrecognizedKeysIssue } from "zod";
import { Show, For } from "solid-js";

export function UnrecognizedKeyIssue(props: { issue: ZodIssueBase }) {
  const issue = () =>
    isUnrecognizedKeyIssue(props.issue) ? props.issue : null;

  return (
    <Show when={issue()}>
      {(issue) => (
        <ul class="pl-4 list-disc list-inside">
          <For each={issue().keys}>{(key) => <li>[{key}]</li>}</For>
        </ul>
      )}
    </Show>
  );
}

export function isUnrecognizedKeyIssue(
  value: ZodIssueBase
): value is ZodUnrecognizedKeysIssue {
  return "keys" in value;
}
