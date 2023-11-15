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
        // for synchronous spans this should be equal to the `time` field
        // but for asynchonous this is different since the async runtime can
        // switch contexts entering/exiting the span several times
        const processingTime = span.activity.reduce(
            (sum, activity) => sum +
                (convertTimestampToNanoseconds(activity.exitedAt) - convertTimestampToNanoseconds(activity.enteredAt) / 1e6),
            0
        );
        
        return ({
            name: getIpcRequestName({ metadata, span }) || '-',
            initiated: convertTimestampToNanoseconds(span.createdAt) / 1000000,
            time: span.closedAt ? convertTimestampToNanoseconds(span.closedAt) - convertTimestampToNanoseconds(span.createdAt) / 1e6 : 0,
            processingTime,
            waterfall: `width:${span.width}%;margin-left:${span.marginLeft}%;`,
            start: span.marginLeft
        })
    })
}