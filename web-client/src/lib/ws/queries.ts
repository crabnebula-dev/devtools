import type { Filter, QueryID, WSQuery } from "./types";

function query(method: QueryID, params?: object): WSQuery {
  switch (method) {
    case "logs_unwatch":
      return {
        jsonrpc: "2.0",
        id: "logs_unwatch",
        method: "logs_unwatch",
        // @ts-expect-error TODO
        params,
      };
    case "logs_watch":
      return {
        jsonrpc: "2.0",
        id: "logs_watch",
        method: "logs_watch",
       // @ts-expect-error TODO
        params,
      };
    case "metrics":
      return {
        id: "metrics",
        jsonrpc: "2.0",

        method: "performance_getMetrics",
        // @ts-expect-error TODO
        params,
      };
    case "spans_watch":
      return {
        id: "spans_watch",
        jsonrpc: "2.0",
        method: "spans_watch",
        // @ts-expect-error TODO
        params,
      };
    case "tauri_getConfig":
      return {
        jsonrpc: "2.0",
        id: "tauri_getConfig",
        method: "tauri_getConfig",
        // @ts-expect-error TODO
        params,
      };
    case "tauri_listAssets":
      return {
        jsonrpc: "2.0",
        id: "tauri_listAssets",
        method: "tauri_listAssets",
        // @ts-expect-error TODO
        params,
      };
    case "tauri_getAsset":
      return {
        jsonrpc: "2.0",
        id: "tauri_getAsset",
        method: "tauri_getAsset",
        // @ts-expect-error TODO
        params,
      };
    default:
      throw new Error("QueryID does not exist");
  }
}

export function useSubscriber(socket: WebSocket) {
  return (id: QueryID, params?: object) => {
    socket.send(JSON.stringify(query(id, params)));
  };
}
