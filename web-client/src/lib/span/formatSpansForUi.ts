import { Span } from "../connection/monitor";
import { convertTimestampToNanoseconds } from "../formatters";
import { Metadata } from "../proto/common";
import { getIpcRequestName } from "./getIpcRequestName";
import { normalizeSpans } from "./normalizeSpans";

type Options = {
    spans: Span[]
    metadata: Map<bigint, Metadata>
}
export function formatSpansForUi({ spans, metadata }: Options) {
    return normalizeSpans(spans).map(span => {
        return ({
            name: getIpcRequestName({ metadata, span }) || '-',
            initiated: convertTimestampToNanoseconds(span.createdAt!) / 1000000,
            time: convertTimestampToNanoseconds(span.exitedAt!) - convertTimestampToNanoseconds(span.enteredAt!) / 1e6,
            waterfall: `width:${span.width}%;margin-left:${span.marginLeft}%;`,
            start: span.marginLeft
        })
    })
}