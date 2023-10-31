import { For } from "solid-js";

export interface SidebarProps {
  nav: [string, object][];
  setCurrentNavElement: (navElement: [string, object]) => void;
}

export function Sidebar(props: SidebarProps) {
  const { nav, setCurrentNavElement } = props;
  return (
    <aside class="w-50 border-neutral-800 border-r-2 p-2">
      <h2 class="text-neutral-300 pt-4 text-2xl">Tauri Config</h2>
      <nav class="flex flex-col gap-2 pl-4">
        <For each={nav}>
          {([key, navItem]) => (
            <a
              class="text-neutral-400 hover:text-white"
              href={`#${key}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentNavElement([key, navItem]);
              }}
            >
              {key}
            </a>
          )}
        </For>
      </nav>
      <h2 class="text-neutral-300 p-2 pt-4 text-2xl">JSON Source</h2>
    </aside>
  );
}
