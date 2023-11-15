import { Span } from "../connection/monitor";
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
            initiated: span.createdAt / 1000000,
            time: span.closedAt ? (span.closedAt - span.createdAt) / 1e6 : 0,
            waterfall: `width:${span.width}%;margin-left:${span.marginLeft}%;`,
            start: span.marginLeft,
            slices: span.slices.map(slice => `width:${slice.width}%;margin-left:${slice.marginLeft}%;`)
        })
    })
}