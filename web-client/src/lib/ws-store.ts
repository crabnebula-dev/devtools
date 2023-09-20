import { createContext, useContext } from "solid-js";

type Log = {
  id: number;
  timestamp: number;
  message: string;
  target: string;
  level: "TRACE" | "DEBUG";
  module_path: string;
  file: string;
  line: number;
};

type WSdata = {
  tauriConfig?: Record<"build" | "package" | "plugins" | "tauri", object>;
  perf?: Record<"initialized_at" | "ready_at", number>;
  logs: Log[];
};

export const initialStoreData: WSdata = {
  tauriConfig: undefined,
  perf: undefined,
  logs: [],
};

export const DataContext = createContext<{
  data: WSdata;
}>();

export function useSocketData() {
  const ctx = useContext(DataContext);

  if (!ctx) throw new Error("can not find data context");
  return ctx;
}
