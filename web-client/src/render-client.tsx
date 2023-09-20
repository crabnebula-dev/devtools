import { render } from "solid-js/web";
import "./styles.css";
import Entry from "./entry";
import { Router } from "@solidjs/router";

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
