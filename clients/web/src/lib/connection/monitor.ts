import { HealthCheckResponse_ServingStatus } from "~/lib/proto/health";
import { LogEvent } from "~/lib/proto/logs";
import { Field, Metadata } from "~/lib/proto/common";
import { Metrics } from "~/lib/proto/tauri";
import { Timestamp } from "~/lib/proto/google/protobuf/timestamp";
import { timestampToDate } from "~/lib/formatters";
import { AppMetadata } from "../proto/meta";
import { Versions } from "../proto/tauri";
import { ReactiveMap } from "@solid-primitives/map";
import { ConfigurationStore } from "../tauri/config/retrieve-configurations";

export type HealthStatus = keyof typeof HealthCheckResponse_ServingStatus;

export type Durations = {
  start?: number;
  end: number;
  shortestTime?: number;
  longestTime?: number;
  average: number;
  counted: number;
  openSpans: number;
};

export type IpcData = {
  cmd: string;
  inputs: Record<string, unknown>;
  response: string | null;
  responseKind?: "Ok" | "Err";
  tauriModule?: string;
  tauriCmd?: string;
  tauriInputs?: Record<string, unknown>;
  pluginName?: string;
  pluginCmd?: string;
};

export type EventKind = "global event" | "rust event" | "event";
export type EventData = {
  kind: EventKind;
  event: string;
};

export type Span = {
  id: bigint;
  name: string;
  kind?: "ipc" | "event";

  displayName?: string;
  ipcData?: IpcData;
  eventData?: EventData;
  hasChildError?: boolean;
  hasError: boolean | null;

  parentId?: bigint;
  parent?: Span;
  rootSpan?: Span;
  metadataId: bigint;
  metadata?: Metadata;
  fields: Field[];
  initiated: number;
  createdAt: number;
  enters: { timestamp: number; threadID: number }[];
  exits: { timestamp: number; threadID: number }[];
  children: Span[];
  closedAt: number;
  time: number;
  duration: number;
  isProcessing?: boolean;
  aborted: boolean;
};

export type MonitorData = {
  health: HealthCheckResponse_ServingStatus;
  metadata: Map<bigint, Metadata>;
  logs: LogEvent[];
  spans: ReactiveMap<bigint, Span>;
  // rootSpans: ReactiveMap<bigint, RootSpan>;
  durations: Durations;
  /** The original/parsed tauri configuration we receive from instrumentation */
  tauriConfig?: Record<"build" | "package" | "plugins" | "tauri", object>;
  /** All the parsed configuration files we read from the frontend */
  tauriConfigStore?: ConfigurationStore;
  tauriVersions?: Versions;
  appMetadata?: AppMetadata;
  schema?: object;
  perf: Metrics;
  perfStartDate: Date | null;
  perfReadyDate: Date | null;
  perfElapsed: Timestamp | null;

  connectionStatus: HealthStatus;
};

export function initialDurations() {
  return {
    start: undefined,
    end: Date.now() * 1e6,
    shortestTime: undefined,
    longestTime: undefined,
    average: 0,
    counted: 0,
    openSpans: 0,
  };
}

export const initialMonitorData: MonitorData = {
  health: HealthCheckResponse_ServingStatus.UNKNOWN,
  metadata: new Map(),
  logs: [],
  spans: new ReactiveMap(),
  durations: initialDurations(),
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
