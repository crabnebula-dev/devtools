import { Span } from "../connection/monitor";

export type SpanKind = "ipc" | "event";

export type SpanWithChildren = Span & { children: Span[] };

export type FilteredSpan = { kind?: SpanKind } & Span;

export type FilteredSpanWithChildren = { kind?: SpanKind } & SpanWithChildren;
