import { createResource } from "solid-js";
import { TauriClient } from "~/lib/proto/tauri.client";
import {
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
} from "~/lib/proto/health";

export function getTauriConfig(client: TauriClient) {
  return createResource(client, async () => {
    const buffer = await client.getConfig({});
    try {
      return JSON.parse(buffer.response.raw);
    } catch (e) {
      throw new Error("failed parsing Tauri config");
    }
  });
}

export function getSchema(client: TauriClient) {
  return createResource(client, async () => {
    const buffer = await client.getSchema({});
    try {
      return JSON.parse(buffer.response.raw);
    } catch (e) {
      throw new Error("failed parsing config Schema");
    }
  });
}

export function getTauriMetrics(client: TauriClient) {
  return createResource(client, async () => {
    try {
      const a = await client.getMetrics({});
      return a.response;
    } catch (e) {
      throw new Error("failed parsing Tauri metrics");
    }
  });
}

export function getHealthStatus(res: HealthCheckResponse) {
  if (res.status === HealthCheckResponse_ServingStatus.NOT_SERVING) {
    console.error("Instrumentation server is in trouble");
  }
  return res.status;
}