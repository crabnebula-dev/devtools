import { For } from "solid-js";
import { Tabs } from "@kobalte/core";
import { LOGS_WATCH, PERF_METRICS, TAURI_CONFIG } from "../lib/requests";
import { A, useParams } from "@solidjs/router";

const TABS = [
  {
    url: (wsUrl: string, wsPort: string) => `/dash/${wsUrl}/${wsPort}/tauri`,
    title: "Tauri",
    query: TAURI_CONFIG,
  },
  {
    url: (wsUrl: string, wsPort: string) =>
      `/dash/${wsUrl}/${wsPort}/performance`,
    title: "Performance",
    query: PERF_METRICS,
  },
  {
    url: (wsUrl: string, wsPort: string) => `/dash/${wsUrl}/${wsPort}/console`,
    title: "Console",
    query: LOGS_WATCH,
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
