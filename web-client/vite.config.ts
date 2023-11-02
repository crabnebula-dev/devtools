/**
 * Vitest extends Vite config.
 */
import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import path from "path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { normalizePath } from "vite";

export default defineConfig({
  server: {
    strictPort: true,
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    solidPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            path.resolve(__dirname, "node_modules/file-icons/icons") + "/[!.]*"
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
