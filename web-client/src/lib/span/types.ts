import { Span } from "../connection/monitor";

export type FilteredSpan = { kind?: "ipc" | "event" } & Span
