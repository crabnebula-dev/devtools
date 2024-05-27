import type { Span } from "~/lib/connection/monitor";
import { IpcKinds } from "./ipc-spans";

export function detectIpcKind(span: Span) {
  if (!span.metadata?.name) return;

  for (const ipcKind of IpcKinds) {
    if (ipcKind.names.has(span.metadata.name)) {
      return ipcKind.type;
    }
  }
}
