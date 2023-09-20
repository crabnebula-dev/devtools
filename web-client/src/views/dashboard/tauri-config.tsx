import { For, Show } from "solid-js";
import { Collapsible } from "@kobalte/core";
import { useSocketData } from "~/lib/ws-store";

export default function TauriConfig() {
  const { data } = useSocketData();

  return (
    <Show when={data.tauriConfig}>
      <header class="my-8 text-3xl">
        <h2 class="text-neutral-300">
          Inspecting config for:{" "}
          <span class="font-mono text-white">
            {data.tauriConfig?.package.productName} - v
            {data.tauriConfig?.package.version}
          </span>
        </h2>
      </header>

      <section class="mt-4">
        <h3 class="text-2xl text-cyan-300">Security</h3>
        <ul class="pl-8 flex flex-col gap-3">
          <li>
            CSP: <code>{data.tauriConfig?.tauri.security.csp}</code>
          </li>
          <li>
            Dangerous Disable Asset CSP Modification:{" "}
            {data.tauriConfig?.tauri.security
              .dangerousDisableAssetCspModification
              ? "✅"
              : "❌"}
          </li>
          <li>
            Dangerous Remote Domain IPC Access:{" "}
            {data.tauriConfig?.tauri.security.dangerousRemoteDomainIpcAccess
              ? "✅"
              : "❌"}
          </li>
          <li>
            Freeze Prototype:{" "}
            {data.tauriConfig?.tauri.security.freezePrototype ? "✅" : "❌"}
          </li>
        </ul>
      </section>
      <section class="mt-4">
        <h3 class="text-2xl text-cyan-300">Icons</h3>
        <ul class="pl-8 flex flex-col gap-3">
          <For each={data.tauriConfig?.tauri?.bundle?.icon}>
            {(icon) => <li>{icon()}</li>}
          </For>
        </ul>
      </section>
      <section class="mt-4">
        <Collapsible.Root>
          <Collapsible.Trigger>
            <h3 class="text-2xl text-neutral-400">show JSON source</h3>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <pre class="text-white">
              {/* {JSON.stringify(tauriConfig()?.result.tauri, null, 2)} */}
              {JSON.stringify(data.tauriConfig, null, 2)}
            </pre>
          </Collapsible.Content>
        </Collapsible.Root>
      </section>
    </Show>
  );
}
