import { For, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { useMonitor } from "~/context/monitor-provider";

const TABS = [
  {
    id: "console",
    url: (host: string, port: string) => `/dash/${host}/${port}/console`,
    title: "Console",
  },
  {
    id: "calls",
    url: (host: string, port: string) => `/dash/${host}/${port}/calls`,
    title: "Calls",
  },
  {
    id: "sources",
    url: (host: string, port: string) => `/dash/${host}/${port}/sources`,
    title: "Sources",
  },
  {
    id: "tauri",
    url: (host: string, port: string) => `/dash/${host}/${port}/tauri`,
    title: "Tauri",
  },
];

export function Navigation() {
  const { host, port } = useParams();
  const { monitorData } = useMonitor();
  return (
    <nav>
      <ul class="flex border-b flex-start border-b-neutral-800">
        <For each={TABS}>
          {(tab) => (
            <Show
              when={
                // hide the Sources tab when the app does not have embedded assets on mobile
                tab.id !== "sources" ||
                monitorData.appMetadata?.hasEmbeddedAssets ||
                (monitorData.appMetadata?.os !== "android" &&
                  monitorData.appMetadata?.os !== "ios")
              }
            >
              <li>
                <A
                  // Maximum a11y: respond to both Enter _and_ Space
                  // Buttons natively do this, anchor links not but we
                  // want these to behave like buttons also.
                  // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/button
                  onkeydown={(e) => {
                    if (e.key !== " ") {
                      return;
                    }

                    e.preventDefault();
                    e.currentTarget.click();
                  }}
                  href={tab.url(host, port)}
                  activeClass="border-b-gray-500 hover:border-b-gray-400"
                  inactiveClass="border-b-gray-800 hover:border-b-gray-600"
                  class="flex -mb-[1px] items-center justify-center leading-none border-b py-2 px-4 hover:bg-gray-800 hover:border-gray-800"
                >
                  {tab.title}
                </A>
              </li>
            </Show>
          )}
        </For>
      </ul>
    </nav>
  );
}
