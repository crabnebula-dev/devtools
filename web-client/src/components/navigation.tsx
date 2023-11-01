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
    url: (host: string, port: string) => `/dash/${host}/${port}/sources`,
    title: "Sources",
  },
  {
    url: (host: string, port: string) => `/dash/${host}/${port}/tauri`,
    title: "Tauri",
  },
];

export function Navigation() {
  const { host, port } = useParams();
  return (
    <nav>
      <ul class="flex border-b flex-start border-b-neutral-800">
        <For each={TABS}>
          {(tab) => (
            <li>
              <A
                href={tab.url(host, port)}
                class="flex border-b-neutral-800 -mb-[1px] items-center justify-center leading-none border-b py-2 px-4 hover:bg-gray-800 hover:border-gray-800"
                activeClass="border-b-gray-600 hover:border-b-gray-500"
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
