import {
  getCSP,
  SELF,
  NONE,
  UNSAFE_INLINE,
  WASM_UNSAFE_EVAL,
  UNSAFE_EVAL,
} from "csp-header";
import { env, argv } from "node:process";
import { readFile, writeFile } from "node:fs/promises";

export function generateCSP(isDev = false) {
  const FATHOM_HOST = env.VITE_FATHOM_URL
    ? new URL(env.VITE_FATHOM_URL).host
    : undefined;

  return getCSP({
    reportUri: isDev
      ? ""
      : "https://o4506303762464768.ingest.sentry.io/api/4506303812272128/security/?sentry_key=57614e75ac5f8c480aed3a2dd1528f13",
    directives: {
      "default-src": [SELF],
      "frame-src": [SELF],
      "script-src": isDev
        ? [SELF, UNSAFE_EVAL, FATHOM_HOST].filter(Boolean)
        : [SELF, WASM_UNSAFE_EVAL, FATHOM_HOST].filter(Boolean),
      "style-src": [SELF, UNSAFE_INLINE],
      "connect-src": [SELF, "127.0.0.1", "127.0.0.1:*", "ws://localhost:5173/"],
      "img-src": [SELF, FATHOM_HOST].filter(Boolean),
      "object-src": [NONE],
    },
  });
}

if (argv.includes("-i")) {
  readFile("./netlify.toml", "utf-8").then((toml) =>
    writeFile(
      "./netlify.toml",
      toml.replace(
        /Content-Security-Policy-Report-Only=[^\n]+/,
        `Content-Security-Policy-Report-Only="${generateCSP()}"`,
      ),
      "utf-8",
    ).then(() => console.log("Updated CSP headers in netlify.toml")),
  );
} else {
  console.log(generateCSP());
}
