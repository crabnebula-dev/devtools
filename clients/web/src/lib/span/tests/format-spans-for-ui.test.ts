import { formatSpanForUiWithMetadata } from "../format-spans-for-ui";
import { spans } from "./fixtures/spans";
import { metadata } from "./fixtures/metadata";
import { vi } from "vitest";

describe("formatSpansForUi", () => {
  it("should format spans for UI", () => {
    // Use fake timers so that time elapsed does not invalidate the snapshot
    vi.useFakeTimers();
    // This is basically create time of the last span
    const date = new Date(1701427195267 / 1000000);
    vi.setSystemTime(date);
    expect(
      spans.map((span) => formatSpanForUiWithMetadata(span, metadata, spans))
    ).toMatchSnapshot();
  });
});
