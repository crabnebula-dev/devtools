import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { HealthClient } from "~/lib/proto/health.client";
import { InstrumentClient } from "~/lib/proto/instrument.client";
import { TauriClient } from "~/lib/proto/tauri.client";
import { SourcesClient } from "~/lib/proto/sources.client.ts";
import { MetadataClient } from "../proto/meta.client";
import { SetStoreFunction, createStore } from "solid-js/store";
import { batch } from "solid-js";
import {
  HealthCheckRequest,
  HealthCheckResponse_ServingStatus,
} from "../proto/health";
import { InstrumentRequest } from "../proto/instrument";
import { updateSpanMetadata } from "../span/update/update-span-metadata";
import { updatedSpans } from "../span/update/update-spans";
import { MonitorData } from "./monitor";
import * as Sentry from "@sentry/browser";
import { Metadata_Level } from "../proto/common";
import { updateLogs } from "../span/update/update-logs";

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
      HealthCheckRequest.create({ service: "" }),
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
    HealthCheckRequest.create({ service: "" }),
  );
  const updateStream = instrumentClient.watchUpdates(
    InstrumentRequest.create({}),
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

export function setup(url: string, host: string, port: string) {
  const connection = { ...connect(url), host, port };
  const [connectionStore, setConnection] = createStore(connection);

  return { connectionStore, setConnection };
}

type UpdateStream = ReturnType<typeof connect>["stream"]["update"];

export function addStreamListeners(
  stream: UpdateStream,
  setMonitorData: SetStoreFunction<MonitorData>,
  monitorData: MonitorData,
) {
  stream.responses.onMessage((update) => {
    setMonitorData("health", 1);
    if (update.newMetadata.length > 0) {
      setMonitorData("metadata", (prev) => updateSpanMetadata(prev, update));
    }

    const errorMetadata = new Set(
      update.newMetadata
        .filter(
          (m) => m.id != null && m.metadata?.level === Metadata_Level.ERROR,
        )
        .map((m) => m.id ?? BigInt(-1)),
    );

    const logsUpdate = update.logsUpdate;

    const errorEventParents = new Set(
      update.logsUpdate?.logEvents
        .filter((ev) => ev.parent != null && errorMetadata.has(ev.metadataId))
        .map((ev) => ev.parent ?? BigInt(-1)),
    );

    if (logsUpdate && logsUpdate.logEvents.length > 0) {
      setMonitorData("logs", (prev) => updateLogs(prev, logsUpdate.logEvents));
      Sentry.setMeasurement(
        "droppedLogEvents",
        Number(logsUpdate.droppedEvents),
        "none",
      );
    }

    const spansUpdate = update.spansUpdate;

    if (spansUpdate && spansUpdate.spanEvents.length > 0) {
      batch(() => {
        const durations = updatedSpans(
          errorMetadata,
          errorEventParents,
          monitorData.spans,
          spansUpdate.spanEvents,
          monitorData.metadata,
          monitorData.durations,
        );
        setMonitorData("durations", durations);
      });
      Sentry.setMeasurement(
        "droppedSpanEvents",
        Number(spansUpdate.droppedEvents),
        "none",
      );
    }
  });
}
