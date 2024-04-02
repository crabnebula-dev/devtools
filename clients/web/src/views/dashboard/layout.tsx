import { useParams } from "@solidjs/router";
import { Navigation } from "~/components/navigation";
import { HealthStatus } from "~/components/health-status.tsx";
import { Logo } from "~/components/crabnebula-logo";
import { DisconnectButton } from "~/components/disconnect-button";
import { MonitorProvider } from "~/context/monitor-provider";
import { ConnectionProvider } from "~/context/connection-provider";
import { type JSX } from "solid-js";

import * as styles from "~/css/styles.ts";

type RouteParams = Record<"host" | "port", string>;

type Props = {
  children: JSX.Element;
};

export default function Layout(props: Props) {
  const { host, port } = useParams<RouteParams>();

  return (
    <ConnectionProvider host={host} port={port}>
      <MonitorProvider>
        <header class="grid">
          <Navigation />
        </header>
        <main class="max-h-full overflow-auto">{props.children}</main>
        <footer class="flex justify-between border-t border-gray-800 bg-gray-950">
          <div class="flex border-r border-gray-900">
            <div
              class={
                "border-r border-gray-900" + styles.tab + styles.genericTrans
              }
            >
              <HealthStatus />
            </div>
            <DisconnectButton />
          </div>
          <a
            href="https://www.crabnebula.dev/"
            class={
              "px-2 flex items-center" +
              styles.genericHover +
              styles.genericTrans
            }
          >
            <div class="flex opacity-80 gap-2 items-center text-xs">
              built by <Logo size={16} /> CrabNebula
            </div>
          </a>
        </footer>
      </MonitorProvider>
    </ConnectionProvider>
  );
}
