import { createContext, useContext } from 'solid-js';
import { LogEvent } from '../../generated/logs'
import { Metrics } from 'generated/tauri';
import { Timestamp } from 'generated/google/protobuf/timestamp';
import { SpanEvent } from 'generated/spans';
import { MetaId, Metadata } from 'generated/common';

export type State = {
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
  tauriConfig: undefined,
  perf: {
    initializedAt: undefined,
    readyAt: undefined,
  },
  logs: [],
  spans: [],

  get perfStartDate() {
    return this.perf.initializedAt ? timestampToDate(this.perf.initializedAt) : null
  },

  get perfReadyDate() {
    return this.perf.readyAt ? timestampToDate(this.perf.readyAt) : null
  },

  get perfElapsed() {
    if (
      typeof this.perf.initializedAt?.seconds === "number" &&
      typeof this.perf.readyAt?.seconds === "number"
    ) {
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
