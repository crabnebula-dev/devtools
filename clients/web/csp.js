import getCSP from "content-security-policy-builder";
import { argv } from "node:process";
import { readFile, writeFile } from "node:fs/promises";

const SELF = "'self'";
const NONE = "'none'";
const UNSAFE_INLINE = "'unsafe-inline'";
const WASM_UNSAFE_EVAL = "'wasm-unsafe-eval'";
const UNSAFE_EVAL = "'unsafe-eval'";

export function generateCSP(isDev = false, fathomUrl) {
  const fathomHost = fathomUrl ? new URL(fathomUrl).host : undefined;

  return getCSP({
    directives: {
      "default-src": [SELF],
      "frame-src": [SELF],
      "script-src": isDev
        ? [SELF, UNSAFE_EVAL, fathomHost].filter(Boolean)
        : [SELF, WASM_UNSAFE_EVAL, fathomHost].filter(Boolean),
      "style-src": [SELF, UNSAFE_INLINE],
      "connect-src": [SELF, "127.0.0.1", "127.0.0.1:*", "ws://localhost:5173/"],
      "img-src": [SELF, fathomHost].filter(Boolean),
      "object-src": [NONE],
      ...(isDev
        ? {}
        : {
            "report-uri":
              "https://o4506303762464768.ingest.sentry.io/api/4506303812272128/security/?sentry_key=57614e75ac5f8c480aed3a2dd1528f13",
          }),
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
