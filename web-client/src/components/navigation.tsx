import { For } from "solid-js";
import { A, useParams } from "@solidjs/router";

const TABS = [
  {
    url: (wsUrl: string, wsPort: string) => `/dash/${wsUrl}/${wsPort}/console`,
    title: "Console",
  },
  {
    url: (wsUrl: string, wsPort: string) => `/dash/${wsUrl}/${wsPort}/calls`,
    title: "Call Stack",
  },
  {
    url: (wsUrl: string, wsPort: string) => `/dash/${wsUrl}/${wsPort}/assets`,
    title: "Assets",
  },
  {
    url: (wsUrl: string, wsPort: string) => `/dash/${wsUrl}/${wsPort}/tauri`,
    title: "Tauri",
  },
];

export function Navigation() {
  const { wsUrl, wsPort } = useParams();
  return (
    <nav class="pt-10">
      <ul class="flex flex-start text-lg border-b-[1px] border-b-neutral-800">
        <For each={TABS}>
          {(tab) => (
            <li class="">
              <A
                href={tab.url(wsUrl, wsPort)}
                class="border-[1px] border-gray-700  border-b-0 py-2 px-8"
                activeClass=" border-[1px] border-b-0 border-gray-700 py-2 bg-gray-900"
              >
                {tab.title}
              </A>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}
