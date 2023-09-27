import type { Filter, Query, QueryID, WSQuery } from "./types";

function query<T extends QueryID>(id: T, filter?: Filter): Query<T>;
function query(id: QueryID, filter?: Filter): WSQuery {
  switch (id) {
    case "logs_unwatch":
      return {
        jsonrpc: "2.0",
        id: "logs_unwatch",
        method: "logs_unwatch",
        params: {
          subscription: {},
        },
      };
    case "logs_watch":
      return {
        jsonrpc: "2.0",
        id: "logs_watch",
        method: "logs_watch",
        params: {
          filter,
        },
      };
    case "metrics":
      return {
        id: "metrics",
        jsonrpc: "2.0",

        method: "performance_getMetrics",
        params: {
          filter,
        },
      };
    case "spans_watch":
      return {
        id: "spans_watch",
        jsonrpc: "2.0",
        method: "spans_watch",
        params: {
          filter,
        },
      };
    case "tauri_getConfig":
      return {
        jsonrpc: "2.0",
        id: "tauri_getConfig",
        method: "tauri_getConfig",
        params: {},
      };
    default:
      throw new Error("QueryID does not exist");
  }
}

export function useSubscriber(socket: WebSocket) {
  return (id: QueryID, params?: Filter) => {
    socket.send(JSON.stringify(query(id, params)));
  };
}
