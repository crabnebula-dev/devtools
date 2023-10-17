import { For } from "solid-js";
import { A, useParams } from "@solidjs/router";

const TABS = [
  {
    url: (host: string, port: string) => `/dash/${host}/${port}/console`,
    title: "Console",
  },
  {
    url: (host: string, port: string) => `/dash/${host}/${port}/calls`,
    title: "Call Stack",
  },
  {
    url: (host: string, port: string) => `/dash/${host}/${port}/assets`,
    title: "Assets",
  },
  {
    url: (host: string, port: string) => `/dash/${host}/${port}/tauri`,
    title: "Tauri",
  },
];

export function Navigation() {
  const { host, port } = useParams();
  return (
    <nav class="pt-10">
      <ul class="flex flex-start text-lg border-b-[1px] border-b-neutral-800">
        <For each={TABS}>
          {(tab) => (
            <li>
              <A
                href={tab.url(host, port)}
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
