import { createContext, useContext } from "solid-js";
import { HealthCheckResponse_ServingStatus } from "~/lib/proto/health";
import { LogEvent } from "~/lib/proto/logs";
import { Field, Metadata } from "~/lib/proto/common";
import { Metrics } from "~/lib/proto/tauri";
import { Timestamp } from "~/lib/proto/google/protobuf/timestamp";
import { timestampToDate } from "~/lib/formatters";
import { AppMetadata } from "../proto/meta";
import { Versions } from "../proto/tauri";

export type Span = {
  id: bigint;
  metadataId: bigint;
  fields: Field[];
  children: Span[];
  createdAt?: Timestamp;
  enteredAt?: Timestamp;
  exitedAt?: Timestamp;
};

export type MonitorData = {
  health: HealthCheckResponse_ServingStatus;
  metadata: Map<bigint, Metadata>;
  logs: LogEvent[];
  spans: Span[];

  tauriConfig?: Record<"build" | "package" | "plugins" | "tauri", object>;
  tauriVersions?: Versions;
  appMetadata?: AppMetadata;
  schema?: object;
  perf: Metrics;
  perfStartDate: Date | null;
  perfReadyDate: Date | null;
  perfElapsed: Timestamp | null;
};

export const initialMonitorData: MonitorData = {
  health: HealthCheckResponse_ServingStatus.UNKNOWN,
  metadata: new Map(),
  logs: [],
  spans: [],

  tauriConfig: undefined,
  tauriVersions: undefined,
  appMetadata: undefined,
  schema: undefined,
  perf: {
    initializedAt: undefined,
    readyAt: undefined,
  },

  get perfStartDate() {
    return this.perf.initializedAt
      ? timestampToDate(this.perf.initializedAt)
      : null;
  },

  get perfReadyDate() {
    return this.perf.readyAt ? timestampToDate(this.perf.readyAt) : null;
  },

  get perfElapsed() {
    if (this.perf.initializedAt && this.perf.readyAt) {
      return {
        seconds: this.perf.readyAt.seconds - this.perf.initializedAt.seconds,
        nanos: this.perf.readyAt.nanos - this.perf.initializedAt.nanos,
      };
    } else {
      return null;
    }
  },
};

export const MonitorContext = createContext<{
  monitorData: MonitorData;
}>();

export function useMonitor() {
  const ctx = useContext(MonitorContext);

  if (!ctx) throw new Error("can not find context");
  return ctx;
}
