import { createContext, useContext } from "solid-js";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

export function connect(wsUrl: string) {
  const abort = new AbortController();
  const transport = new GrpcWebFetchTransport({
    baseUrl: wsUrl,
    abort: abort.signal
  });

  return { transport, abort }
}

export const TransportContext = createContext<{
  transport: GrpcWebFetchTransport,
  abort: AbortController
}>();

export function useTransport() {
  const ctx = useContext(TransportContext);

  if (!ctx) throw new Error("can not find context");
  return ctx;
}
