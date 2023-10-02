import { createContext, useContext } from "solid-js";
import { WSdata } from "./types";

export const DataContext = createContext<{
  data: WSdata;
}>();

export function useSocketData() {
  const ctx = useContext(DataContext);

  if (!ctx) throw new Error("can not find data context");
  return ctx;
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
