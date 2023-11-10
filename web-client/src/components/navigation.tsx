import { For } from "solid-js";
import { A, useParams, useLocation } from "@solidjs/router";
import clsx from "clsx";

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
  const location = useLocation();
  return (
    <nav>
      <ul class="flex border-b flex-start border-b-gray-700">
        <For each={TABS}>
          {(tab) => (
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
                class={clsx(
                  location.pathname === tab.url(host, port)
                    ? "border-b-primary-800 hover:border-b-primary-800"
                    : "border-b-gray-800 hover:border-b-gray-600",

                  // The rest
                  "flex -mb-[1px] items-center justify-center leading-none border-b py-2 px-4 hover:bg-gray-800 hover:border-gray-800"
                )}
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
