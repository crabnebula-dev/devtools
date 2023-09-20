import { createEventSignal } from "@solid-primitives/event-listener";
import { For, createEffect } from "solid-js";
import { useWs } from "../../lib/ws";
import { TAURI_CONFIG } from "../../lib/requests";
import { Collapsible } from "@kobalte/core";

type WSEventSignal = Record<"message", MessageEvent<string>>;

export default function TauriConfig() {
  const { socket } = useWs();
  const message = createEventSignal<WSEventSignal>(socket, "message");

  const tauriConfig = () => {
    if (message()) {
      return JSON.parse(message().data);
    }
  };

  createEffect(() => {
    console.info("sent ws");
    socket.send(JSON.stringify(TAURI_CONFIG));
  });

  return (
    <>
      <header class="my-8 text-3xl">
        <h2 class="text-neutral-300">
          Inspecting config for:{" "}
          <span class="font-mono text-white">
            {tauriConfig()?.result.package.productName} - v
            {tauriConfig()?.result.package.version}
          </span>
        </h2>
      </header>

      <section class="mt-4">
        <h3 class="text-2xl text-cyan-300">Security</h3>
        <ul class="pl-8 flex flex-col gap-3">
          <li>
            CSP: <code>{tauriConfig()?.result.tauri.security.csp}</code>
          </li>
          <li>
            Dangerous Disable Asset CSP Modification:{" "}
            {tauriConfig()?.result.tauri.security
              .dangerousDisableAssetCspModification
              ? "✅"
              : "❌"}
          </li>
          <li>
            Dangerous Remote Domain IPC Access:{" "}
            {tauriConfig()?.result.tauri.security.dangerousRemoteDomainIpcAccess
              ? "✅"
              : "❌"}
          </li>
          <li>
            Freeze Prototype:{" "}
            {tauriConfig()?.result.tauri.security.freezePrototype ? "✅" : "❌"}
          </li>
        </ul>
      </section>
      <section class="mt-4">
        <h3 class="text-2xl text-cyan-300">Icons</h3>
        <ul class="pl-8 flex flex-col gap-3">
          <For each={tauriConfig()?.result?.tauri?.bundle?.icon}>
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
              {JSON.stringify(tauriConfig()?.result.tauri, null, 2)}
            </pre>
          </Collapsible.Content>
        </Collapsible.Root>
      </section>
    </>
  );
}
