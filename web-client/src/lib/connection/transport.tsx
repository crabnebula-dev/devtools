import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { HealthClient } from "~/lib/proto/health.client";
import { InstrumentClient } from "~/lib/proto/instrument.client";
import { TauriClient } from "~/lib/proto/tauri.client";
import { SourcesClient } from "~/lib/proto/sources.client.ts";
import { MetadataClient } from "../proto/meta.client";
import { SetStoreFunction, createStore, produce } from "solid-js/store";
import { HealthCheckRequest } from "../proto/health";
import { InstrumentRequest } from "../proto/instrument";
import { updateSpanMetadata } from "../span/update-span-metadata";
import { updatedSpans } from "../span/update-spans";
import { MonitorData } from "./monitor";
import { createResource } from "solid-js";

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
      setMonitorData(
        "spans",
        produce((clonedSpans) =>
          updatedSpans(clonedSpans, spansUpdate.spanEvents)
        )
      );
    }
  });
}

// function reconnect(connectionStore: ReturnType<typeof connect>,
//   setMonitorData: SetStoreFunction<MonitorData>
// ) {
//   connectionStore.abortController.abort()

//   const [data] =  createResource(async () => {
//     const newConnection = connect(connectionStore.serviceUrl)

//     addStreamListneners(connectionStore.stream.update, setMonitorData)

//   })

// }
