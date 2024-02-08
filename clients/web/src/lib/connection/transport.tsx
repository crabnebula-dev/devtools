import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { HealthClient } from "~/lib/proto/health.client";
import { InstrumentClient } from "~/lib/proto/instrument.client";
import { TauriClient } from "~/lib/proto/tauri.client";
import { SourcesClient } from "~/lib/proto/sources.client.ts";
import { MetadataClient } from "../proto/meta.client";
import { SetStoreFunction, createStore } from "solid-js/store";
import {
  HealthCheckRequest,
  HealthCheckResponse_ServingStatus,
} from "../proto/health";
import { InstrumentRequest } from "../proto/instrument";
import { updateSpanMetadata } from "../span/update-span-metadata";
import { updatedSpans } from "../span/update-spans";
import { MonitorData } from "./monitor";

export async function checkConnection(url: string) {
  const abortController = new AbortController();
  const transport = new GrpcWebFetchTransport({
    format: "binary",
    baseUrl: url,
    abort: abortController.signal,
  });

  try {
    const healthClient = new HealthClient(transport);
    const healthCheck = await healthClient.check(
      HealthCheckRequest.create({ service: "" })
    );

    const statusCode = healthCheck.response.status;
    if (statusCode === 1) {
      return {
        status: "success",
        message: `server status is: ${HealthCheckResponse_ServingStatus[statusCode]}`,
      };
    } else {
      return {
        status: "error",
        message: `server status is: ${HealthCheckResponse_ServingStatus[statusCode]}. Try again...`,
      };
    }
  } catch (e) {
    return { status: "error", message: `failed to connect to ${url}` };
  } finally {
    abortController.abort();
  }
}

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
  const sourcesClient = new SourcesClient(transport);
  const metaClient = new MetadataClient(transport);

  const healthStream = healthClient.watch(
    /**
     * empty string means all services.
     */
    HealthCheckRequest.create({ service: "" })
  );
  const updateStream = instrumentClient.watchUpdates(
    InstrumentRequest.create({})
  );

  const connectionStore = {
    serviceUrl: url,
    abortController,
    client: {
      tauri: tauriClient,
      health: healthClient,
      instrument: instrumentClient,
      sources: sourcesClient,
      meta: metaClient,
    },
    stream: {
      health: healthStream,
      update: updateStream,
    },
  };

  return connectionStore;
}

export function setup(url: string) {
  const [connectionStore, setConnection] = createStore(connect(url));

  return { connectionStore, setConnection };
}

type UpdateStream = ReturnType<typeof connect>["stream"]["update"];

export function addStreamListneners(
  stream: UpdateStream,
  setMonitorData: SetStoreFunction<MonitorData>
) {
  stream.responses.onMessage((update) => {
    setMonitorData("health", 1);
    if (update.newMetadata.length > 0) {
      setMonitorData("metadata", (prev) => updateSpanMetadata(prev, update));
    }

    const logsUpdate = update.logsUpdate;
    if (logsUpdate && logsUpdate.logEvents.length > 0) {
      setMonitorData("logs", (prev) => [...prev, ...logsUpdate.logEvents]);
    }

    const spansUpdate = update.spansUpdate;
    if (spansUpdate && spansUpdate.spanEvents.length > 0) {
      setMonitorData("spans", (spans) => [
        ...updatedSpans(spans, spansUpdate.spanEvents),
      ]);
    }
  });
}
