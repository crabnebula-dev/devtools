import { WSdata } from "./types";

export const initialStoreData: WSdata = {
  tauriConfig: undefined,
  perf: {
    initialized_at: undefined,
    ready_at: undefined,
  },
  logs: [],
  spans: [],

  get perfStartDate() {
    return typeof this.perf.initialized_at === "number"
      ? new Date(this.perf.initialized_at)
      : null;
  },

  get perfReadyDate() {
    return typeof this.perf.ready_at === "number"
      ? new Date(this.perf.ready_at)
      : null;
  },

  get perfElapsed() {
    if (
      typeof this.perf.initialized_at === "number" &&
      typeof this.perf.ready_at === "number"
    ) {
      return this.perf.ready_at - this.perf.initialized_at;
    } else {
      return null;
    }
  },
};
