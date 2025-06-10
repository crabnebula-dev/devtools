import {
  getCSP,
  SELF,
  NONE,
  UNSAFE_INLINE,
  WASM_UNSAFE_EVAL,
  UNSAFE_EVAL,
} from "csp-header";

export function generateCSP(isDev = false) {
  return getCSP({
    reportUri: isDev
      ? ""
      : "https://o4506303762464768.ingest.sentry.io/api/4506303812272128/security/?sentry_key=57614e75ac5f8c480aed3a2dd1528f13",
    directives: {
      "default-src": [SELF],
      "frame-src": [SELF],
      "script-src": isDev
        ? [SELF, UNSAFE_EVAL, process.env.VITE_FATHOM_URL]
        : [SELF, WASM_UNSAFE_EVAL, process.env.VITE_FATHOM_URL],
      "style-src": [SELF, UNSAFE_INLINE],
      "connect-src": [SELF, "127.0.0.1", "127.0.0.1:*", "ws://localhost:5173/"],
      "img-src": [SELF, process.env.VITE_FATHOM_URL],
      "object-src": [NONE],
    },
  });
}

console.log(generateCSP());
