import { Span } from "../connection/monitor";

function scaleNumbers(numbers: number[], min: number, max: number): number[] {
    const range = max - min;
    return numbers.map(num => ((num - min) / range) * 100).map(num => Math.max(0, Math.min(num, 100)));
}

function scaleToMax(numbers: number[], max: number): number[] {
    return numbers.map(num => (num / max) * 100);
}

export function normalizeSpans(spans: Span[]) {
    const start = Math.min(...spans.map(span => span.createdAt));
    const end = Math.max(...spans.filter(s => s.closedAt > 0).map(span => span.closedAt));
    const totalDuration = end - start;

    const result = spans.map(span => {
        const allExits = span.exits.reduce((acc, e) => acc + e, 0);
        const allEnters = span.enters.reduce((acc, e) => acc + e, 0);
        return {
            width: scaleToMax([span.duration], totalDuration)[0],
            marginLeft: scaleNumbers([span.createdAt], start, end)[0],
            slices: span.enters.map((enter, i) => {
                const width = scaleToMax([span.exits[i] - enter], allExits - allEnters)[0];
                const offset = scaleNumbers([enter], span.createdAt, span.closedAt)[0];
                const marginLeft = offset - (offset * width / 100);
                return {
                    width,
                    marginLeft
                }
            })
        }
    })

    const newSpans = spans.map((s, i) => ({ ...s, ...result[i] }))
    return newSpans;
}
