import { For, Suspense } from "solid-js";
import { FileIcon } from "~/components/icons/ide-icons";
import { A } from "@solidjs/router";
import {
  configurationObject,
  retrieveConfigurations,
  getTauriTabBasePath,
} from "~/lib/tauri/tauri-conf-schema";

export function Sidebar() {
  const [configEntries] = retrieveConfigurations();

  return (
    <>
      <h2 class="text-neutral-300 p-4 pb-2 text-2xl">Config</h2>
      <Suspense fallback={<span>Loading...</span>}>
        <For each={configEntries()}>{(child) => <Config config={child} />}</For>
      </Suspense>
    </>
  );
}

function Config(props: { config: configurationObject }) {
  return (
    <section class="p-2">
      <div class="grid gap-1.5 items-center text-left grid-cols-[1em_1fr] text-xl">
        <FileIcon path="tauri.conf.json" />
        {props.config.label}
      </div>
      <nav class="flex flex-col pl-8">
        <For each={Object.entries(props.config.data ?? {})}>
          {([name]) => (
            <TabLink
              name={name}
              key={props.config.key}
              size={props.config.size}
            />
          )}
        </For>
      </nav>
    </section>
  );
}

function TabLink(props: { name: string; key: string; size: number }) {
  const basePath = getTauriTabBasePath();
  return (
    <A
      href={`${basePath}/${props.key}/${props.name}?size=${props.size}`}
      activeClass="hover:bg-[#eaebeb] hover:border-[#2DCC9F] bg-[#00555A] border-[#2DCC9F] text-white"
      class="text-lg border-b-2 hover:bg-[#00555A] hover:border-[#2DCC9F] p-1 border-neutral-800 text-neutral-400 hover:text-white grid gap-1.5 items-center text-left grid-cols-[1em_1fr]"
    >
      <FileIcon path={props.name} />
      {props.name}
    </A>
  );
}
