import { For, Suspense } from "solid-js";
import { FileIcon } from "~/components/icons/ide-icons";
import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { retrieveConfigurations } from "~/lib/tauri/tauri-conf-schema";

export interface SidebarProps {
  setCurrentNavElement: (navElement: { name: string; config: object }) => void;
}

export function Sidebar(props: SidebarProps) {
  const [configEntries] = retrieveConfigurations();

  const [currentNavKey, setCurrentNavKey] = createSignal("");

  return (
    <>
      <h2 class="text-neutral-300 p-4 pb-2 text-2xl">Config</h2>
      <Suspense fallback={<span>Loading...</span>}>
        <For each={configEntries()}>
          {(child) => (
            <div class="p-2">
              <div class="flex text-xl items-center">
                <div class="w-10">
                  <FileIcon path={child.path} />
                </div>
                <span class="px-2">{child.path}</span>
              </div>
              <nav class="flex flex-col pl-8">
                <For each={Object.entries(child.data ?? {})}>
                  {([tabName, tabValue]) => (
                    <A
                      href={"?path=" + child.path + "&size=" + child.size}
                      onClick={(e) => {
                        props.setCurrentNavElement({
                          name: tabName,
                          config: tabValue,
                        });
                        setCurrentNavKey(tabName + child.path);
                      }}
                    >
                      <div
                        class={
                          currentNavKey() === tabName + child.path
                            ? "border-b-2 hover:bg-[#00555A] hover:border-[#2DCC9F] p-1 bg-[#00555A] border-[#2DCC9F] text-white"
                            : "border-b-2 hover:bg-[#00555A] hover:border-[#2DCC9F] p-1 border-neutral-800 text-neutral-400 hover:text-white"
                        }
                      >
                        <p class="text-lg">
                          <span class="inline-block w-6 align-middle mx-2">
                            <FileIcon path={tabName} />
                          </span>
                          {tabName}
                        </p>
                      </div>
                    </A>
                  )}
                </For>
              </nav>
            </div>
          )}
        </For>
      </Suspense>
    </>
  );
}
