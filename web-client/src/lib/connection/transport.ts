import { createContext, useContext } from "solid-js";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { HealthClient } from "~/lib/proto/health.client";
import { InstrumentClient } from "~/lib/proto/instrument.client";
import { TauriClient } from "~/lib/proto/tauri.client";
import { MetadataClient } from "../proto/meta.client";

export function connect(url: string) {
  const abortController = new AbortController();
  const transport = new GrpcWebFetchTransport({
    format: "binary",
    baseUrl: url,
    abort: abortController.signal,
  });

  const instrumentClient = new InstrumentClient(transport);
  const tauriClient = new TauriClient(transport);
  const healthClient = new HealthClient(transport);
  const metaClient = new MetadataClient(transport);

  return {
    abortController,
    client: {
      tauri: tauriClient,
      health: healthClient,
      instrument: instrumentClient,
      meta: metaClient
    },
  };
}

export type Connection = ReturnType<typeof connect>;

export function disconnect(controller: AbortController) {
  controller.abort();
}

export const TransportContext = createContext<{
  transport: GrpcWebFetchTransport;
  abort: AbortController;
}>();

export function useTransport() {
  const ctx = useContext(TransportContext);

  if (!ctx) throw new Error("can not find TransportContext.Provider");
  return ctx;
}
