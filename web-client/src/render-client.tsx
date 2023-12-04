import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import "./styles.css";
import Entry from "./entry";
import * as Sentry from "@sentry/browser";
import { DEV } from "solid-js";

if (!DEV) {
  Sentry.init({
    dsn: "https://57614e75ac5f8c480aed3a2dd1528f13@o4506303762464768.ingest.sentry.io/4506303812272128",
    tunnel: "/app/sentry-tunnel",
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 0,
  });
}

const app = document.getElementById("app");

if (!app) throw new Error("No #app element found in the DOM.");

render(
  () => (
    <Router>
      <Entry />
    </Router>
  ),
  app
);
