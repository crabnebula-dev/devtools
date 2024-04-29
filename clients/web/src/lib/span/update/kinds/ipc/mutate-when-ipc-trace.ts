import type { Span } from "~/lib/connection/monitor";
import { detectIpcTrace } from "./detect-ipc-trace";

export function mutateWhenIpcTrace(root: Span): boolean {
  const ipcData = detectIpcTrace(root);
  if (!ipcData) return false;
  root.kind = "ipc";
  root.displayName = ipcData.pluginName
    ? `plugin: ${ipcData.pluginName}.${ipcData.pluginCmd}`
    : ipcData.tauriModule
      ? `${ipcData.tauriModule}.${ipcData.tauriCmd}`
      : `command: ${ipcData.cmd}`;
  root.ipcData = ipcData;
  root.hasError = root.hasError || ipcData.responseKind === "Err";
  return true;
}
