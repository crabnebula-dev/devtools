import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import "./styles.css";
import Entry from "./entry";

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
