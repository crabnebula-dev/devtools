export type WSEventSignal = Record<"message", MessageEvent<string>>;

export type Log = {
  id: number;
  timestamp: number;
  message: string;
  target: string;
  level: "TRACE" | "DEBUG";
  module_path: string;
  file: string;
  line: number;
};

export type WSdata = {
  tauriConfig?: Record<"build" | "package" | "plugins" | "tauri", object>;
  perf: Record<"initialized_at" | "ready_at", number | undefined>;
  logs: Log[];
  spans: unknown[];
  perfStartDate: Date | null;
  perfReadyDate: Date | null;
  perfElapsed: number | null;
};

export type Filter = {
  level: "DEBUG" | "INFO";
  text?: string;
};

type TauriGetConfigPayload = {
  id: "tauri_getConfig";
  jsonrpc: "2.0";
  method: "tauri_getConfig";
  params: object;
};

type LogsWatchPayload = {
  id: "logs_watch";
  jsonrpc: "2.0";

  method: "logs_watch";
  params: {
    filter?: Filter;
  };
};

type LogsUnwatchPayload = {
  id: "logs_unwatch";
  jsonrpc: "2.0";

  method: "logs_unwatch";
  params: {
    subscription: object;
  };
};

type SpansWatchPayload = {
  id: "spans_watch";
  jsonrpc: "2.0";

  method: "spans_watch";
  params: {
    filter?: Filter;
  };
};

type PerfMetricsPayload = {
  id: "metrics";
  jsonrpc: "2.0";

  method: "performance_getMetrics";
  params: {
    filter?: Filter;
  };
};

export type WSQuery =
  | TauriGetConfigPayload
  | LogsWatchPayload
  | SpansWatchPayload
  | LogsUnwatchPayload
  | PerfMetricsPayload;

export type QueryID = WSQuery["id"];
export type Query<T extends QueryID, U = WSQuery> = U extends {
  id: T;
}
  ? U
  : never;
