import { sentryVitePlugin } from "@sentry/vite-plugin";
import { generateCSP } from "./csp";
/**
 * Vitest extends Vite config.
 */
import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import path from "path";
import wasm from "vite-plugin-wasm";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { normalizePath } from "vite";

export default defineConfig({
  server: {
    strictPort: true,
    headers: {
      "Content-Security-Policy": generateCSP(
        process.env.NODE_ENV === "development"
      ),
    },
  },
  build: {
    // file-icons need top-level await
    // this is as far back as we can go without needing top-level-await polyfills
    // we can't use the polyfill because it breaks SolidJS router.
    target: ["safari15", "chrome89", "firefox89"],

    sourcemap: true,
  },
  plugins: [
    solidPlugin(),
    wasm(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            path.resolve(
              __dirname,
              "node_modules/@crabnebula/file-icons/icons"
            ) + "/[!.]*"
          ),
          dest: "./icons/",
        },
        {
          src: normalizePath(
            path.resolve(__dirname, "node_modules/shiki/dist/onig.wasm")
          ),
          dest: "./shiki/",
        },
        {
          src: normalizePath(
            path.resolve(__dirname, "node_modules/shiki/languages/") + "/*"
          ),
          dest: "./shiki/languages/",
        },
        {
          src: normalizePath(
            path.resolve(
              __dirname,
              "node_modules/shiki/themes/material-theme-ocean.json"
            )
          ),
          dest: "./shiki/themes/",
        },
      ],
    }),
    sentryVitePlugin({
      org: "crabnebula-ltd",
      project: "devtools",
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    transformMode: { web: [/\.[jt]sx?$/] },
    deps: {
      inline: ["@solidjs/testing-library"],
    },
  },
});
