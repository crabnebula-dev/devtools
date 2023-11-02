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
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            path.resolve(__dirname, "node_modules/file-icons/icons") + "/[!.]*"
          ),
          dest: "./icons/",
        },
      ],
    }),
    wasm(),
    topLevelAwait(),
    solidPlugin(),
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
