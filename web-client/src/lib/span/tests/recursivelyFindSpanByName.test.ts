import { describe, expect } from "vitest";
import { recursivelyFindSpanByName } from "../recursivelyFindSpanByName";
import { metadata } from "./fixtures/metadata";
import { spans } from "./fixtures/spans";

describe("recursivelyFindSpanByName", () => {
  it("should recursively find a span by name", () => {
    expect(
      // @ts-expect-error this is a test...
      recursivelyFindSpanByName({ span: spans[0], metadata }, "cmd")
    ).toMatchSnapshot();
  });
});
