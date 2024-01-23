import { Navigate, Router, RouteDefinition } from "@solidjs/router";
import { lazy, ErrorBoundary } from "solid-js";
import { setCDN } from "@crabnebula/file-icons";
import { ErrorRoot } from "./components/errors/error-root.tsx";
import * as Sentry from "@sentry/browser";
import Layout from "./views/dashboard/layout.tsx";

const ROUTES = [
  {
    path: "/",
    component: lazy(() => import("./views/connect.tsx")),
  },
  {
    path: "/dash/:host/:port",
    component: (props) => <Layout>{props.children}</Layout>,
    children: [
      {
        path: "/",
        component: () => <Navigate href="console" />,
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
      throw new Error("404 - Not Found: The specified path was not found");
    },
  },
] satisfies RouteDefinition[];

export default function Entry() {
  setCDN("/icons");

  return (
    <ErrorBoundary
      fallback={(error) => {
        Sentry.captureException(error);
        return <ErrorRoot error={error} />;
      }}
    >
      <Router>{ROUTES}</Router>
    </ErrorBoundary>
  );
}
