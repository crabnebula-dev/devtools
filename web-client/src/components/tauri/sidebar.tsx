import { For } from "solid-js";
import FileIcon from "~/components/icons/file.tsx";
import { createEffect, createSignal } from "solid-js";

export interface SidebarProps {
  nav: [string, object][];
  setCurrentNavElement: (navElement: [string, object]) => void;
}

export function Sidebar(props: SidebarProps) {
  const { nav, setCurrentNavElement } = props;
  const [currentNavKey, setCurrentNavKey] = createSignal(nav[0][0]);

  return (
    <>
      <h2 class="text-neutral-300 p-4 pb-2 text-2xl">Config</h2>
      <nav class="flex flex-col pl-8">
        <For each={nav}>
          {([key, navItem]) => (
            <a
              href={`#${key}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentNavElement([key, navItem]);
                setCurrentNavKey(key);
              }}
            >
              <div
                class={
                  currentNavKey() === key
                    ? "border-b-2 hover:bg-[#00555A] hover:border-[#2DCC9F] p-1 bg-[#00555A] border-[#2DCC9F] text-white"
                    : "border-b-2 hover:bg-[#00555A] hover:border-[#2DCC9F] p-1 border-neutral-800 text-neutral-400 hover:text-white"
                }
              >
                <p class="text-lg">
                  <span class="inline-block w-6 align-middle mx-2">
                    <FileIcon path={".json"} />
                  </span>
                  {key}
                </p>
              </div>
            </a>
          )}
        </For>
      </nav>
    </>
  );
}
