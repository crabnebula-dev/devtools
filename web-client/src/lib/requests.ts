export const LOGS_WATCH = {
  jsonrpc: "2.0",
  // unique id could be used to match async result
  id: "logs_watch",
  method: "logs_watch",
  params: {},
};

export const TAURI_CONFIG = {
  jsonrpc: "2.0",
  // unique id could be used to match async result
  id: 1,
  method: "tauri_getConfig",
  params: {},
};

export const LOGS_UNWATCH = (currentSubscription: object) => ({
  jsonrpc: "2.0",
  // unique id could be used to match async result
  id: "logs_unwatch",
  method: "logs_unwatch",
  params: [currentSubscription],
});

export const PERF_METRICS = {
  jsonrpc: "2.0",
  // unique id could be used to match async result
  id: "metrics",
  method: "performance_getMetrics",
  params: {},
};
