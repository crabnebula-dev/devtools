import { For, Suspense, Show } from "solid-js";
import { FileIcon } from "~/components/icons/ide-icons";
import { A } from "@solidjs/router";
import { type ConfigurationObject } from "~/lib/tauri/config/retrieve-configurations";
import { Loader } from "~/components/loader";
import { getTauriTabBasePath } from "~/lib/tauri/get-tauri-tab-base-path";
import { useMonitor } from "~/context/monitor-provider";
import { TauriConfig } from "~/lib/tauri/config/tauri-conf";

import * as styles from "~/css/styles.ts";

export function Sidebar() {
  const { monitorData } = useMonitor();

  return (
    <>
      <Suspense fallback={<Loader />}>
        <div class={"flex flex-col h-full" + styles.surface}>
          <For each={monitorData.tauriConfigStore?.configs}>
            {(child) => <Config config={child} />}
          </For>
        </div>
      </Suspense>
    </>
  );
}

function Config(props: { config: ConfigurationObject }) {
  const basePath = getTauriTabBasePath();

  return (
    <section
      class={
        "my-2 first:mt-0 filter hover:brightness-125 border-slate-400" +
        styles.hierarchy
      }
    >
      <div class="p-2 mb-2 flex flex-row gap-2 font-bold items-center bg-slate-800 bg-opacity-50 truncate">
        <div class="w-5 h-5">
          <FileIcon path="tauri.conf.json" />
        </div>
        <Show
          when={hasProductName(props.config.data)}
          fallback={"Untitled App"}
        >
          {(productName) => productName()}
        </Show>
      </div>
      <A
        draggable={false}
        href={`${basePath}/${props.config.key}/`}
        activeClass="text-white"
      >
        <Show when={props.config.error}>⚠</Show>
      </A>
      <nav>
        <ul>
          <For each={Object.entries(props.config.data ?? {})}>
            {([name]) => (
              <A
                draggable={false}
                href={`${basePath}/${props.config.key}/${name}?size=${props.config.size}`}
                activeClass={"filter saturate-1" + styles.hierarchyActive}
                inactiveClass={"filter saturate-[0.1] opacity-70"}
              >
                <li class={styles.hierarchyItem}>
                  <div class={styles.hierarchyIcon}>
                    <FileIcon path=".json" />
                  </div>
                  {name}
                </li>
              </A>
            )}
          </For>
        </ul>
      </nav>
    </section>
  );
}

function hasProductName(config?: TauriConfig) {
  if (!config || !("productName" in config)) return false;

  return config.productName;
}
