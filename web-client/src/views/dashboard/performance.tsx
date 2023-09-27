import {createResource, Show} from "solid-js";
import {useTransport} from "~/lib/transport.tsx";
import {TauriClient} from "../../../generated/tauri.client.ts";
import {MetricsRequest} from "../../../generated/tauri.ts";
import {Timestamp} from "../../../generated/google/protobuf/timestamp.ts";

function formatTimestamp(timestamp: Timestamp) {
    return Number(timestamp.seconds) * 1000 + (timestamp.nanos / 1e6)
}

export default function Performance() {
  const { transport } = useTransport();
  const client = new TauriClient(transport);

  const [metrics] = createResource(async () => {
    const res = await client.getMetrics(MetricsRequest.create({}));
    return res.response
  })

  return <Show when={!metrics.loading}>
    <pre class="text-white">
      InitializedAt: {formatTimestamp(metrics()?.initializedAt!)}
    </pre>
    <pre class="text-white">
      ReadyAt: {formatTimestamp(metrics()?.readyAt!)}
    </pre>
  </Show>;
}
