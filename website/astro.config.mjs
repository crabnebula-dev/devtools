import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import sitemap from "@astrojs/sitemap";

import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  site: "https://devtools.crabnebula.dev",
  output: "server",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    solidJs(),
    sitemap(),
  ],
  adapter: netlify(),
});
