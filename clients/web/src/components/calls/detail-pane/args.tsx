import { For, Show } from "solid-js";
import { Span } from "~/lib/connection/monitor";
import { spanFieldsToObject } from "~/lib/span/span-fields-to-object";

export function Args(props: { call: Span }) {
  const valuesSectionTitle = () => {
    if (props.call.ipcData?.inputs) {
      return "Inputs";
    }

    switch (props.call.kind) {
      case "ipc":
        return "Inputs";
      case "event":
        return "Args";
      default:
        return "Fields";
    }
  };

  const values = () => {
    return [
      props.call.ipcData?.tauriInputs ?? {},
      props.call.ipcData?.inputs ?? {},
      spanFieldsToObject(props.call),
    ];
  };
  return (
    <div class="grid gap-2">
      <h2 class="text-xl p-4">{valuesSectionTitle()}</h2>
      <table>
        <tbody>
          {" "}
          <For each={values()}>
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
                        !["cmd", "callback", "error", "__tauriModule"].includes(
                          k,
                        )
                      }
                    >
                      <tr class="even:bg-nearly-invisible">
                        <Show when={k}>
                          <td class="py-1 px-4 font-bold">{k}</td>
                        </Show>
                        <td class="py-1 px-4">
                          {typeof v === "object"
                            ? JSON.stringify(v)
                            : String(v)}
                        </td>
                      </tr>
                    </Show>
                  )}
                </For>
              );
            }}
          </For>
        </tbody>
      </table>
    </div>
  );
}
