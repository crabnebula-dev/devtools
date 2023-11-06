import { createContext, useContext } from "solid-js";
import { HealthCheckResponse_ServingStatus } from "~/lib/proto/health";
import { LogEvent } from "~/lib/proto/logs";
import { SpanEvent } from "~/lib/proto/spans";
import { MetaId, Metadata } from "~/lib/proto/common";
import { Metrics } from "~/lib/proto/tauri";
import { Timestamp } from "~/lib/proto/google/protobuf/timestamp";
import { timestampToDate } from "~/lib/formatters";

export type MonitorData = {
  health: HealthCheckResponse_ServingStatus;
  metadata: Map<number, Metadata>;
  logs: LogEvent[];
  spans: SpanEvent[];

  tauriConfig?: Record<"build" | "package" | "plugins" | "tauri", object>;
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
