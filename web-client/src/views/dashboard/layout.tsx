import { Outlet, useParams } from "@solidjs/router";
import { Navigation } from "~/components/navigation";
import { BootTime } from "~/components/boot-time";
import { HealthStatus } from "~/components/health-status.tsx";
import { Logo } from "~/components/crabnebula-logo";
import { DisconnectButton } from "~/components/disconnect-button";
import { MonitorProvider } from "~/context/monitor-provider";
import { ConnectionProvider } from "~/context/connection-provider";

type RouteParams = Record<"host" | "port", string>;

export default function Layout() {
  const { host, port } = useParams<RouteParams>();

  return (
    <ConnectionProvider host={host} port={port}>
      <MonitorProvider>
        <header class="grid">
          <div class="border-b border-gray-800 flex px-2 py-1 items-center justify-between">
            <HealthStatus />
            <BootTime />
            <DisconnectButton />
          </div>
          <Navigation />
        </header>
        <main class="max-h-full overflow-auto">
          <Outlet />
        </main>
        <footer class="p-2 flex justify-center border-t border-gray-800 gap-2 items-center">
          Built by <Logo size={16} /> CrabNebula
        </footer>
        <div class="overflow-hidden absolute inset-0 w-full h-full -z-10">
          <img
            class="relative opacity-30 scale-110 bg-surface bg-surface"
            src="/bg.jpeg"
            aria-hidden
          />
        </div>
      </MonitorProvider>
    </ConnectionProvider>
  );
}
