import { For, Show } from "solid-js";

export function Args(props: { args: (string | object)[] }) {
  return (
    <For each={props.args}>
      {(arg) => {
        return (
          <For
            each={Object.entries(
              typeof arg === "string" ? JSON.parse(arg) : arg,
            )}
          >
            {([k, v]) => (
              <Show
                when={
                  !["cmd", "callback", "error", "__tauriModule"].includes(k)
                }
              >
                <tr class="even:bg-nearly-invisible">
                  <Show when={k}>
                    <td class="py-1 px-4 font-bold">{k}</td>
                  </Show>
                  <td class="py-1 px-4">
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </td>
                </tr>
              </Show>
            )}
          </For>
        );
      }}
    </For>
  );
}
