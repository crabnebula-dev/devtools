import { describe } from "vitest";
import { normalizeSpans } from "./normalizeSpans";

describe("normalizeSpans", () => {
    it("should accept an array of time ranges and return an array of normalized time ranges", () => {
        const timeRanges = [
            { start: 0, end: 10 },
            { start: 10, end: 20 },
            { start: 20, end: 30 }
        ];
        expect(normalizeSpans(timeRanges)).toEqual(
            [
                {
                    "duration": 10,
                    "normalizedStart": 0,
                    "normalizedWidth": 33.33333333333333,
                },
                {
                    "duration": 10,
                    "normalizedStart": 0.033333333333333326,
                    "normalizedWidth": 33.33333333333333,
                },
                {
                    "duration": 10,
                    "normalizedStart": 0.06666666666666665,
                    "normalizedWidth": 33.33333333333333,
                },
            ]
        );
    })
    it("should scale based on granularity", () => {
        const timeRanges = [
            { start: 0, end: 10 },
            { start: 10, end: 20 },
            { start: 20, end: 30 }
        ];
        expect(normalizeSpans(timeRanges, 4)).toEqual(
            [
                {
                    "duration": 10,
                    "normalizedStart": 0,
                    "normalizedWidth": 133.33333333333331,
                },
                {
                    "duration": 10,
                    "normalizedStart": 0.1333333333333333,
                    "normalizedWidth": 133.33333333333331,
                },
                {
                    "duration": 10,
                    "normalizedStart": 0.2666666666666666,
                    "normalizedWidth": 133.33333333333331,
                },
            ]
        )
    })
})