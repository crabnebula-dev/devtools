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
      <div class="flex text-xl items-center">
        <div class="w-10 px-2">
          <FileIcon path={props.config.path} />
        </div>
        {props.config.path}
      </div>
      <nav class="flex flex-col pl-8">
        <For each={Object.entries(props.config.data ?? {})}>
          {([name]) => (
            <TabLink
              name={name}
              path={props.config.path}
              size={props.config.size}
            />
          )}
        </For>
      </nav>
    </section>
  );
}

function TabLink(props: { name: string; path: string; size: number }) {
  const basePath = getTauriTabBasePath();
  return (
    <A
      href={`${basePath}/${props.path}/${props.name}?size=${props.size}`}
      activeClass="hover:bg-[#eaebeb] hover:border-[#2DCC9F] bg-[#00555A] border-[#2DCC9F] text-white"
      class="text-lg border-b-2 hover:bg-[#00555A] hover:border-[#2DCC9F] p-1 border-neutral-800 text-neutral-400 hover:text-white"
    >
      <div class="inline-block w-6 align-middle mx-2">
        <FileIcon path={props.name} />
      </div>
      {props.name}
    </A>
  );
}
