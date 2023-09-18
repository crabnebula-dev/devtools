import { useRoutes } from "@solidjs/router";
import { lazy } from "solid-js";

const ROUTES = [
  {
    path: "/",
    component: lazy(() => import("./views/connect.tsx")),
  },
  {
    path: "/dash/:wsUrl/:wsPort",
    component: lazy(() => import("./views/dashboard/layout.tsx")),
    children: [
      {
        path: "/tauri",
        component: lazy(() => import("./views/dashboard/tauri-config.tsx")),
      },
      {
        path: "/performance",
        component: lazy(() => import("./views/dashboard/performance.tsx")),
      },
      {
        path: "/console",
        component: lazy(() => import("./views/dashboard/console.tsx")),
      },
    ],
  },
];

export default function Entry() {
  const Routes = useRoutes(ROUTES);

  return (
    <main class="bg-black text-white min-h-screen">
      <Routes />
    </main>
  );
}
