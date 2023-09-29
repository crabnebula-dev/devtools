import {createContext, useContext} from 'solid-js';
import {LogEvent} from '../../generated/logs'
import {Metrics} from 'generated/tauri';
import {Timestamp} from 'generated/google/protobuf/timestamp';
import {SpanEvent} from 'generated/spans';
import {Metadata, MetaId} from 'generated/common';
import {HealthCheckResponse_ServingStatus} from "../../generated/health.ts";

export type State = {
  health: HealthCheckResponse_ServingStatus
  metadata: Map<MetaId, Metadata>,
  logs: LogEvent[];
  spans: SpanEvent[];

  tauriConfig?: Record<"build" | "package" | "plugins" | "tauri", object>;
  perf: Metrics,
  perfStartDate: Date | null;
  perfReadyDate: Date | null;
  perfElapsed: Timestamp | null;
};

export function timestampToDate(ts: Timestamp): Date {
  return new Date(Number(ts.seconds * 1000n) + (ts.nanos / 1e6))
}

export const initialState: State = {
  health: HealthCheckResponse_ServingStatus.UNKNOWN,
  metadata: new  Map(),
  logs: [],
  spans: [],

  tauriConfig: undefined,
  perf: {
    initializedAt: undefined,
    readyAt: undefined,
  },

  get perfStartDate() {
    return this.perf.initializedAt ? timestampToDate(this.perf.initializedAt) : null
  },

  get perfReadyDate() {
    return this.perf.readyAt ? timestampToDate(this.perf.readyAt) : null
  },

  get perfElapsed() {
    if (this.perf.initializedAt && this.perf.readyAt) {
      return {
        seconds: this.perf.readyAt.seconds - this.perf.initializedAt.seconds,
        nanos: this.perf.readyAt.nanos - this.perf.initializedAt.nanos
      }
    } else {
      return null;
    }
  },
};

export const StateContext = createContext<{
  state: State;
}>();

export function useState() {
  const ctx = useContext(StateContext);

  if (!ctx) throw new Error("can not find context");
  return ctx;
}
