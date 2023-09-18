import { createWS, createWSState } from "@solid-primitives/websocket";
import { Accessor, createContext, useContext } from "solid-js";

export const SOCKET_STATES = new Map([
  [WebSocket.CONNECTING, "Connecting"],
  [WebSocket.OPEN, "Connected"],
  [WebSocket.CLOSING, "Disconnecting"],
  [WebSocket.CLOSED, "Disconnected"],
]);

export type WSContext = {
  socket: WebSocket;
  state: Accessor<Map<0 | 1 | 2 | 3 | 4, string>>;
};

export function getWSstate(socket: WebSocket) {
  const stateAccessor = createWSState(socket);
  const state = () => SOCKET_STATES.get(stateAccessor());

  return state;
}

export function connectWS(wsUrl: string) {
  const socket = createWS(wsUrl);
  const stateAccessor = createWSState(socket);
  const state = () => SOCKET_STATES.get(stateAccessor()) as string;

  return { socket, state };
}

export const WSContext = createContext<{
  socket: WebSocket;
  state: () => string;
}>();

export function useWs() {
  const ctx = useContext(WSContext);

  if (!ctx) throw new Error("can not find context");
  return ctx;
}
