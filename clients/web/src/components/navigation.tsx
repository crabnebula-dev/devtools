import { For, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import { useMonitor } from "~/context/monitor-provider";

import * as styles from "~/css/styles.ts";

const TABS = [
  {
    id: "console",
    url: (host: string, port: string) => `/dash/${host}/${port}/console`,
    title: "Console",
    icon: "terminal",
  },
  {
    id: "calls",
    url: (host: string, port: string) => `/dash/${host}/${port}/calls`,
    title: "Calls",
    icon: "page-scroll",
  },
  {
    id: "sources",
    url: (host: string, port: string) => `/dash/${host}/${port}/sources`,
    title: "Sources",
    icon: "code",
  },
  {
    id: "tauri",
    url: (host: string, port: string) => `/dash/${host}/${port}/tauri`,
    title: "Config",
    icon: "tauri",
  },
];

export function Navigation() {
  const { host, port } = useParams();
  const { monitorData } = useMonitor();
  return (
    <nav class="bg-gray-900 border-b border-b-gray-700 bg-opacity-50">
      <ul class="flex flex-start h-full">
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
              <li class="h-full">
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
                  draggable={false}
                  href={tab.url(host, port)}
                  activeClass={styles.tabActive}
                  inactiveClass={styles.tabInactive}
                  class={
                    styles.tab +
                    styles.genericHover +
                    styles.genericActive +
                    styles.genericTrans
                  }
                >
                  <img
                    class="h-4"
                    alt={tab.title}
                    src={`/icons/${tab.icon ? tab.icon : "new-tab"}.svg`}
                  />
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
