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

type WSQuery =
  | {
      id: "tauri_getConfig";
      jsonrpc: "2.0";
      method: "tauri_getConfig";
      params: object;
    }
  | {
      id: "logs_watch";
      jsonrpc: "2.0";

      method: "logs_watch";
      params: {
        filter?: Filter;
      };
    }
  | {
      id: "spans_watch";
      jsonrpc: "2.0";

      method: "spans_watch";
      params: {
        filter?: Filter;
      };
    }
  | {
      id: "logs_unwatch";
      jsonrpc: "2.0";

      method: "logs_unwatch";
      params: {
        subscription: object;
      };
    }
  | {
      id: "metrics";
      jsonrpc: "2.0";

      method: "performance_getMetrics";
      params: {
        filter?: Filter;
      };
    };

export type QueryID = WSQuery["id"];
export type Query<T extends QueryID, U = WSQuery> = U extends {
  id: T;
}
  ? U
  : never;
