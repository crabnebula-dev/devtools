import { HealthCheckResponse_ServingStatus } from "~/lib/proto/health";
import { LogEvent } from "~/lib/proto/logs";
import { Field, Metadata } from "~/lib/proto/common";
import { Metrics } from "~/lib/proto/tauri";
import { Timestamp } from "~/lib/proto/google/protobuf/timestamp";
import { timestampToDate } from "~/lib/formatters";
import { AppMetadata } from "../proto/meta";
import { Versions } from "../proto/tauri";

export type HealthStatus = keyof typeof HealthCheckResponse_ServingStatus;

export type Span = {
  id: bigint;
  parentId?: bigint;
  metadataId: bigint;
  fields: Field[];
  createdAt: number;
  enters: { timestamp: number; threadID: number }[];
  exits: { timestamp: number; threadID: number }[];
  closedAt: number;
  duration: number;
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

  connectionStatus: HealthStatus;
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

  get connectionStatus() {
    return HealthCheckResponse_ServingStatus[this.health] as HealthStatus;
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
