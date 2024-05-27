import { createScriptLoader } from "@solid-primitives/script-loader";

export function loadFathom() {
  const fathomUrl = import.meta.env.VITE_FATHOM_URL;
  const fathomId = import.meta.env.VITE_FATHOM_ID;
  if (fathomUrl && fathomId)
    createScriptLoader({ src: fathomUrl, "data-site": fathomId, defer: true });
}
