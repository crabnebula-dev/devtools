import { formatSpansForUi } from "../format-spans-for-ui";
import { spans } from "./fixtures/spans";
import { metadata } from "./fixtures/metadata";

describe("formatSpansForUi", () => {
  it("should format spans for UI", () => {
    // @ts-expect-error this is a test...
    expect(
      formatSpansForUi({ allSpans: spans, spans, metadata })
    ).toMatchSnapshot();
  });
});
