import { createResource } from "solid-js";
import { TauriClient } from "~/lib/proto/tauri.client";

export function getTauriConfig(client: TauriClient) {
  return createResource(async () => {
    const buffer = await client.getConfig({});
    try {
      return JSON.parse(buffer.response.raw);
    } catch (e) {
      throw new Error("failed parsing Tauri config");
    }
  });
}

export function getTauriMetrics(client: TauriClient) {
  return createResource(async () => {
    try {
      const a = await client.getMetrics({});
      return a.response;
    } catch (e) {
      throw new Error("failed parsing Tauri config");
    }
  });
}
