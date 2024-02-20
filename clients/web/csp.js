import {
  getCSP,
  SELF,
  NONE,
  UNSAFE_INLINE,
  WASM_UNSAFE_EVAL,
} from "csp-header";

export function generateCSP(isDev = false) {
  return getCSP({
    reportUri: isDev
      ? ""
      : "https://o4506303762464768.ingest.sentry.io/api/4506303812272128/security/?sentry_key=57614e75ac5f8c480aed3a2dd1528f13",
    directives: {
      "default-src": [SELF],
      "frame-src": [SELF],
      "script-src": [SELF, WASM_UNSAFE_EVAL],
      "style-src": isDev ? [SELF, UNSAFE_INLINE] : [SELF],
      "connect-src": [SELF, "127.0.0.1", "127.0.0.1:*", "ws://localhost:5173/"],
      "img-src": [SELF],
      "object-src": [NONE],
    },
  });
}

console.log(generateCSP());
