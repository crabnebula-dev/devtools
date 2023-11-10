type TimeRange = {
    start: number;
    end: number;
}

export function normalizeSpans(data: TimeRange[], granularity = 1) {
    const minTime = Math.min(...data.map(e => e.start));
    const maxTime = Math.max(...data.map(e => e.end));

    const totalDuration = maxTime - minTime;

    const result = data.map(event => {
        const scaledStart = minTime + ((event.start - minTime) * granularity);
        const scaledEnd = minTime + ((event.end - minTime) * granularity);
        const normalizedStart = ((scaledStart - minTime) / totalDuration) * 100;
        const normalizedWidth = ((scaledEnd - scaledStart) / totalDuration) * 100;

        return {
            normalizedStart: normalizedStart / 1e3,
            normalizedWidth: normalizedWidth,
            duration: event.end - event.start
        };
    });

    return result;
}
