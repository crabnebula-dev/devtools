import { findSpansByName } from "../find-spans-by-name";
import { metadata } from "./fixtures/metadata";
import { spans } from "./fixtures/spans";

describe("findSpansByName", () => {
  it("should find a span by name", () => {
    expect(
      // @ts-expect-error this is a test...
      findSpansByName({ span: spans[0], metadata }, "cmd")
    ).toMatchSnapshot();
  });
});
