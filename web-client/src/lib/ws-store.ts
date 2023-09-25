import { createContext, useContext } from "solid-js";

export type WSEventSignal = Record<"message", MessageEvent<string>>;

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
  perf: Record<"initialized_at" | "ready_at", number | undefined>;
  logs: Log[];
  perfStartDate: Date | null;
  perfReadyDate: Date | null;
  perfElapsed: number | null;
};

export const initialStoreData: WSdata = {
  tauriConfig: undefined,
  perf: {
    initialized_at: undefined,
    ready_at: undefined,
  },
  logs: [],

  get perfStartDate() {
    return typeof this.perf.initialized_at === "number"
      ? new Date(this.perf.initialized_at)
      : null;
  },

  get perfReadyDate() {
    return typeof this.perf.ready_at === "number"
      ? new Date(this.perf.ready_at)
      : null;
  },

  get perfElapsed() {
    if (
      typeof this.perf.initialized_at === "number" &&
      typeof this.perf.ready_at === "number"
    ) {
      return this.perf.ready_at - this.perf.initialized_at;
    } else {
      return null;
    }
  },
};

export const DataContext = createContext<{
  data: WSdata;
}>();

export function useSocketData() {
  const ctx = useContext(DataContext);

  if (!ctx) throw new Error("can not find data context");
  return ctx;
}
