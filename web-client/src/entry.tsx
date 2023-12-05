import {
  type RouteDefinition,
  useNavigate,
  useRoutes,
  Navigate,
} from "@solidjs/router";
import { lazy, ErrorBoundary } from "solid-js";
import { setCDN } from "@crabnebula/file-icons";
import { ErrorRoot } from "./components/error-root.tsx";
import * as Sentry from "@sentry/browser";

const ROUTES: RouteDefinition[] = [
  {
    path: "/",
    component: () => Navigate({ href: "/app" }),
  },
  {
    path: "/app",
    component: lazy(() => import("./views/connect.tsx")),
  },
  {
    path: "/app/dash/:host/:port",
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
        component: lazy(() => import("./views/dashboard/calls.tsx")),
      },
      {
        path: "/tauri/:config?/:selected?",
        component: lazy(() => import("./views/dashboard/tauri.tsx")),
      },
      {
        path: "/sources/*source",
        component: lazy(() => import("./views/dashboard/sources.tsx")),
      },
    ],
  },
  {
    path: "*",
    component: () => {
      /**
       * momentary workaround
       */
      window.location.href = "https://crabnebula.dev/devtools-threw-404";
      return null;
    },
  },
];

export default function Entry() {
  const Routes = useRoutes(ROUTES);

  setCDN("/app/icons");

  return (
    <ErrorBoundary
      fallback={(error) => {
        Sentry.captureException(error);
        return <ErrorRoot error={error} />;
      }}
    >
      <Routes />
    </ErrorBoundary>
  );
}
