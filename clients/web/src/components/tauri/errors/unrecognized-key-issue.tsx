import { z } from "zod";
import { Show, For } from "solid-js";

export function UnrecognizedKeyIssue(props: { issue: z.core.$ZodIssueBase }) {
  const issue = () =>
    isUnrecognizedKeyIssue(props.issue) ? props.issue : null;

  return (
    <Show when={issue()}>
      {(unrecognizedIssue) => (
        <ul class="pl-4 list-disc list-inside">
          <For each={unrecognizedIssue().keys}>{(key) => <li>[{key}]</li>}</For>
        </ul>
      )}
    </Show>
  );
}

export function isUnrecognizedKeyIssue(
  value: z.core.$ZodIssueBase,
): value is z.core.$ZodIssueUnrecognizedKeys {
  return "keys" in value;
}
