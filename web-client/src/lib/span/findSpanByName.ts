import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";

type Options = { span: Span, metadata: Map<bigint, Metadata> }

export function findSpanByName({ span, metadata }: Options, name: string): Span | null {
    const meta = metadata.get(span.metadataId)!;
    if (meta.name === name) {
        return span;
    } else {
        for (const child of span.children) {
            const s = findSpanByName({ span: child, metadata }, name);
            if (s) {
                return s;
            }
        }
    }
    return null;
}