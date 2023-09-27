import { createWS, createWSState } from "@solid-primitives/websocket";
import { Accessor } from "solid-js";

export const SOCKET_STATES = new Map([
  [WebSocket.CONNECTING, "Connecting" as const],
  [WebSocket.OPEN, "Connected" as const],
  [WebSocket.CLOSING, "Disconnecting" as const],
  [WebSocket.CLOSED, "Disconnected" as const],
]);

export type WSContext = {
  socket: WebSocket;
  state: Accessor<typeof SOCKET_STATES>;
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
