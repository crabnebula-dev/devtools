import { useNavigate, useRoutes } from "@solidjs/router";
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
        path: "/",
        component: () => {
          useNavigate()("console");

          return null;
        },
      },
      {
        path: "/console",
        component: lazy(() => import("./views/dashboard/console.tsx")),
      },
      {
        path: "/calls",
        component: lazy(() => import("./views/dashboard/span-waterfall.tsx")),
      },
      {
        path: "/tauri",
        component: lazy(() => import("./views/dashboard/tauri-config.tsx")),
      },
      {
        path: "/assets",
        component: lazy(() => import("./views/dashboard/tauri-assets.tsx")),
      },
    ],
  },
];

export default function Entry() {
  const Routes = useRoutes(ROUTES);

  return (
    <div class="root-bg text-white h-screen overflow-x-hidden">
      <Routes />
    </div>
  );
}
