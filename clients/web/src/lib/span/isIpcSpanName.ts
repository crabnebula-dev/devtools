import { IpcSpanName, ipcSpans } from "./ipc-spans";

export const isIpcSpanName = (name: string): name is IpcSpanName => {
  return ipcSpans.includes(name as unknown as IpcSpanName);
};
