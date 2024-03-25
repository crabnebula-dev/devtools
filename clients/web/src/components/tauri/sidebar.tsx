import { For, Suspense, Show } from "solid-js";
import { FileIcon } from "~/components/icons/ide-icons";
import { A } from "@solidjs/router";
import { type ConfigurationObject } from "~/lib/tauri/config/retrieve-configurations";
import { Loader } from "~/components/loader";
import { getTauriTabBasePath } from "~/lib/tauri/get-tauri-tab-base-path";
import { useMonitor } from "~/context/monitor-provider";

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
    <section class={styles.hierarchy}>
      <div class="p-2 mb-2 flex flex-row gap-2 font-bold items-center border-b border-slate-700 truncate">
        <div class="w-5 h-5">
          <FileIcon path="tauri.conf.json" />
        </div>
        {props.config.data.productName
          ? props.config.data.productName
          : "Untitled App"}
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
                activeClass={styles.hierarchyActive}
              >
                <li
                  class={
                    styles.hierarchyItem +
                    " filter saturate-0 hover:saturate-50"
                  }
                >
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
