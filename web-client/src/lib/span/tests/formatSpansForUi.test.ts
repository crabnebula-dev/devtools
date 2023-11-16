import { describe, expect } from "vitest";
import { formatSpansForUi } from "../formatSpansForUi";
import { spans } from "./fixtures/spans";
import { metadata } from "./fixtures/metadata";

describe("formatSpansForUi", () => {
  it("should format spans for UI", () => {
    // @ts-expect-error this is a test...
    expect(formatSpansForUi({ spans, metadata })).toMatchSnapshot();
  });
});
