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
    <nav>
      <ul class="flex flex-start border-b-neutral-800">
        <For each={TABS}>
          {(tab) => (
            <li>
              <A
                href={tab.url(wsUrl, wsPort)}
                class="border-black bg-black flex items-center justify-center leading-none border-b-2 py-2 px-4 hover:bg-gray-800 hover:border-gray-800"
                activeClass="border-gray-600 hover:border-gray-500"
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
