import { Span } from "../connection/monitor";

export type SpanWithChildren = Span & { children: Span[] };
