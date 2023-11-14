import { Span } from "../connection/monitor";
import { convertTimestampToNanoseconds } from "../formatters";

export function normalizeSpans(spans: Span[]) {
    const data = spans.filter(s => s.enteredAt && s.exitedAt).map(span => ({
        start: convertTimestampToNanoseconds(span.enteredAt!),
        end: convertTimestampToNanoseconds(span.exitedAt!),
    }))

    const earliestStart = Math.min(...data.map(e => e.start));
    const latestStart = Math.max(...data.map(e => e.start));
    const timeDomain = latestStart - earliestStart;
    const totalDuration = data.reduce((acc, e) => {
        return acc + (e.end - e.start);
    }, 0)

    const result = data.map(event => {
        const width = ((event.end - event.start) / totalDuration) * 100;
        const offset = (((event.start - earliestStart) / timeDomain) * 100);
        const marginLeft = offset - (((offset - width) / 100) * width);

        return {
            marginLeft,
            width,
        };
    });

    const newSpans = spans.map((s, i) => ({ ...s, ...result[i] }))
    return newSpans;
}
