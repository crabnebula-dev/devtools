import {For, createResource, Show} from "solid-js";
import { useTransport } from "../../lib/transport.tsx";
import { Collapsible } from "@kobalte/core";
import {TauriClient} from "../../../generated/tauri.client.ts";
import {ConfigRequest} from "../../../generated/tauri.ts";

export default function TauriConfig() {
  const { transport } = useTransport();
  const client = new TauriClient(transport);

  const [tauriConfig] = createResource(async () => {
    const res = await client.getConfig(ConfigRequest.create({}));
    return JSON.parse(res.response.raw)
  })

  return (
    <>
      <Show when={!tauriConfig.loading}>
      <header class="my-8 text-3xl">
        <h2 class="text-neutral-300">
          Inspecting config for:{" "}
          <span class="font-mono text-white">
            {tauriConfig().package.productName} - v
            {tauriConfig().package.version}
          </span>
        </h2>
      </header>

      <section class="mt-4">
        <h3 class="text-2xl text-cyan-300">Security</h3>
        <ul class="pl-8 flex flex-col gap-3">
          <li>
            CSP: <code>{tauriConfig().tauri.security.csp}</code>
          </li>
          <li>
            Dangerous Disable Asset CSP Modification:{" "}
            {tauriConfig().tauri.security
              .dangerousDisableAssetCspModification
              ? "✅"
              : "❌"}
          </li>
          <li>
            Dangerous Remote Domain IPC Access:{" "}
            {tauriConfig().tauri.security.dangerousRemoteDomainIpcAccess
              ? "✅"
              : "❌"}
          </li>
          <li>
            Freeze Prototype:{" "}
            {tauriConfig().tauri.security.freezePrototype ? "✅" : "❌"}
          </li>
        </ul>
      </section>
      <section class="mt-4">
        <h3 class="text-2xl text-cyan-300">Icons</h3>
        <ul class="pl-8 flex flex-col gap-3">
          <For each={tauriConfig().tauri?.bundle?.icon}>
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
              {JSON.stringify(tauriConfig().tauri, null, 2)}
            </pre>
          </Collapsible.Content>
        </Collapsible.Root>
      </section>
      </Show>
    </>
  );
}
