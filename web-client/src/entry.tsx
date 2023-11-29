import { type RouteDefinition, useNavigate, useRoutes } from "@solidjs/router";
import { lazy, ErrorBoundary } from "solid-js";
import { setCDN } from "@crabnebula/file-icons";
import { ErrorRoot } from "./components/error-root.tsx";
import * as Sentry from "@sentry/browser";

const ROUTES: RouteDefinition[] = [
  {
    path: "/",
    component: lazy(() => import("./views/connect.tsx")),
  },
  {
    path: "/dash/:host/:port",
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
        path: "/tauri/:config?/:selected?",
        component: lazy(() => import("./views/dashboard/tauri.tsx")),
      },
      {
        path: "/sources/*source",
        component: lazy(() => import("./views/dashboard/sources.tsx")),
      },
    ],
  },
];

export default function Entry() {
  const Routes = useRoutes(ROUTES);

  setCDN("/icons");

  return (
    <ErrorBoundary
      fallback={(error) => {
        const eventId = Sentry.captureException(error);
        Sentry.showReportDialog({ eventId });
        return <ErrorRoot error={error} />;
      }}
    >
      <Routes />
    </ErrorBoundary>
  );
}
