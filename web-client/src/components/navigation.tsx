import { For } from "solid-js";
import { Tabs } from "@kobalte/core";
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
    <Tabs.Root>
      <Tabs.List class="flex flex-start gap-3 text-2xl">
        <For each={TABS}>
          {(tab) => (
            <A href={tab.url(wsUrl, wsPort)} activeClass="text-purple-400">
              {tab.title}
            </A>
          )}
        </For>
        <Tabs.Indicator />
      </Tabs.List>
    </Tabs.Root>
  );
}
