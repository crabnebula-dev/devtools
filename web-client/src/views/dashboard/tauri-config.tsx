import { For, Show } from "solid-js";
import { Collapsible } from "@kobalte/core";
import { evaluateCSP } from "~/lib/security";
import { useMonitor } from "~/lib/connection/monitor";

function formatBooleanProp(prop?: boolean) {
  return prop ? "✅" : "❌";
}

export default function TauriConfig() {
  const { monitorData } = useMonitor();

  return (
    <>
      <Show when={monitorData.tauriConfig?.package}>
        {(pkg) => (
          <header class="my-8 text-3xl">
            <h2 class="text-neutral-300">
              Inspecting config for:{" "}
              <span class="font-mono text-white">
                {pkg().productName} - v{pkg().version}
              </span>
            </h2>
          </header>
        )}
      </Show>

      <Show when={monitorData.tauriConfig?.tauri.security}>
        {(sec) => (
          <section class="mt-4">
            <Collapsible.Root>
              <Collapsible.Trigger>
                <h3 class="text-2xl text-cyan-300">Security</h3>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <ul class="pl-8 flex flex-col gap-3">
                  <li>
                    CSP: <code>{sec().csp}</code>
                    <pre>{evaluateCSP(sec().csp)}</pre>
                  </li>
                  <li>
                    Dangerous Disable Asset CSP Modification:{" "}
                    {formatBooleanProp(
                      sec().dangerousDisableAssetCspModification
                    )}
                  </li>
                  <li>
                    Dangerous Remote Domain IPC Access:{" "}
                    {formatBooleanProp(sec().dangerousRemoteDomainIpcAccess)}
                  </li>
                  <li>
                    Freeze Prototype: {formatBooleanProp(sec().freezePrototype)}
                  </li>
                </ul>
              </Collapsible.Content>
            </Collapsible.Root>
          </section>
        )}
      </Show>
      <Show when={monitorData.tauriConfig?.tauri.bundle}>
        {(bundle) => (
          <section class="mt-4">
            <h3 class="text-2xl text-cyan-300">Icons</h3>
            <ul class="pl-8 flex flex-col gap-3">
              <For each={bundle().icon}>{(icon) => <li>{icon()}</li>}</For>
            </ul>
          </section>
        )}
      </Show>
      <section class="mt-4">
        <Collapsible.Root>
          <Collapsible.Trigger>
            <h3 class="text-2xl text-neutral-400">show JSON source</h3>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <pre class="text-white">
              {/* {JSON.stringify(tauriConfig()?.result.tauri, null, 2)} */}
              {JSON.stringify(monitorData.tauriConfig, null, 2)}
            </pre>
          </Collapsible.Content>
        </Collapsible.Root>
      </section>
    </>
  );
}
