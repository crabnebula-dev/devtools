import { Span } from "../connection/monitor";
import { UiSpan } from "./format-spans-for-ui";

export type SpanKind = "ipc" | "event";

export type SpanWithChildren = Span & { children: Span[] };

export type FilteredSpan = { kind?: SpanKind } & Span;

export type FilteredSpanWithChildren = {
  kind?: SpanKind;
  children: Span[] | UiSpan[];
} & Span;
