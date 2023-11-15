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
        return {
            width: scaleToMax([span.duration], totalDuration)[0],
            marginLeft: scaleNumbers([span.createdAt], start, end)[0],
        }
    })

    const newSpans = spans.map((s, i) => ({ ...s, ...result[i] }))
    return newSpans;
}
