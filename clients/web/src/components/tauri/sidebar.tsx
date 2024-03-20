import { For, Suspense, Show } from "solid-js";
import { FileIcon } from "~/components/icons/ide-icons";
import { A } from "@solidjs/router";
import { type ConfigurationObject } from "~/lib/tauri/config/retrieve-configurations";
import { Loader } from "~/components/loader";
import { getTauriTabBasePath } from "~/lib/tauri/get-tauri-tab-base-path";
import { useMonitor } from "~/context/monitor-provider";

export function Sidebar() {
  const { monitorData } = useMonitor();

  return (
    <>
      <Suspense fallback={<Loader />}>
        <For each={monitorData.tauriConfigStore?.configs}>
          {(child) => <Config config={child} />}
        </For>
      </Suspense>
    </>
  );
}

function Config(props: { config: ConfigurationObject }) {
  const basePath = getTauriTabBasePath();
  return (
    <section class="p-2">
      <A
        draggable={false}
        href={`${basePath}/${props.config.key}/`}
        activeClass="text-white"
        class="grid gap-1.5 items-center text-left grid-cols-[1rem_1fr] text-xl text-neutral-400"
      >
        <FileIcon path="tauri.conf.json" />
        {props.config.label}
        <Show when={props.config.error}>⚠</Show>
      </A>
      <nav class="flex flex-col">
        <ul>
          <For each={Object.entries(props.config.data ?? {})}>
            {([name]) => (
              <li>
                <TabLink
                  name={name}
                  key={props.config.key}
                  size={props.config.size}
                />
              </li>
            )}
          </For>
        </ul>
      </nav>
    </section>
  );
}

function TabLink(props: { name: string; key: string; size: number }) {
  const basePath = getTauriTabBasePath();
  return (
    <A
      draggable={false}
      href={`${basePath}/${props.key}/${props.name}?size=${props.size}`}
      activeClass="hover:bg-slate-700 bg-slate-800 text-white"
      class="text-lg hover:bg-slate-600 p-1 pl-4 text-neutral-400 hover:text-white grid gap-1.5 items-center text-left grid-cols-[1rem_1fr]"
    >
      <FileIcon path={props.name} />
      {props.name}
    </A>
  );
}
