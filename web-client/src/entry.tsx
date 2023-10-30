import { type RouteDefinition, useNavigate, useRoutes } from "@solidjs/router";
import { lazy } from "solid-js";
import { connect } from "./lib/connection/transport.ts";

const ROUTES: RouteDefinition[] = [
  {
    path: "/",
    component: lazy(() => import("./views/connect.tsx")),
  },
  {
    path: "/dash/:host/:port",
    component: lazy(() => import("./views/dashboard/layout.tsx")),
    data: ({ params }) => {
      const { host, port } = params;
      const connection = connect(`http://${host}:${port}`);

      return connection;
    },
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
        component: lazy(() => import("./views/dashboard/tauri.tsx")),
      },
      {
        path: "/assets/*path",
        component: lazy(() => import("./views/dashboard/asset-viewer.tsx")),
      },
    ],
  },
];

export default function Entry() {
  const Routes = useRoutes(ROUTES);

  return <Routes />;
}
