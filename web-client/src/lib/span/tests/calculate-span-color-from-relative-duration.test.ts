import { calculateSpanColorFromRelativeDuration } from "../calculate-span-color-from-relative-duration";

describe("calculateSpanColorFromRelativeDuration", () => {
  it("should return bg-red-500 when inputValue is greater than 150", () => {
    expect(calculateSpanColorFromRelativeDuration(151)).toBe("bg-red-500");
  });
  it("should return bg-yellow-400 when inputValue is greater than 100", () => {
    expect(calculateSpanColorFromRelativeDuration(101)).toBe("bg-yellow-400");
  });
  it("should return bg-teal-500 when inputValue is less than 100", () => {
    expect(calculateSpanColorFromRelativeDuration(99)).toBe("bg-teal-500");
  });
});
