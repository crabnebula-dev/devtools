import { findLineNumberByNestedKeyInSource } from "../find-line-number-by-nested-key-in-source";
import fs from "fs";

const validConfig = fs.readFileSync(
  "./src/lib/tauri/tests/fixtures/valid-config.json",
  "utf-8"
);

describe("findLineNumberByNestedKey", () => {
  it("should be able to find top level keys.", () => {
    expect(findLineNumberByNestedKeyInSource(validConfig, "app")).toBe(14);
  });

  it("should be able to find deeply nested keys.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "bundle.active")
    ).toBe(29);
  });

  it("should not break when the key is not in the config.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "app.windows.bogus")
    ).toBe(-1);
  });

  it("should be able to resolve array values.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "bundle.icon.2")
    ).toBe(34);
  });

  it("should be able to resolve array values and their children.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "app.windows.0.height")
    ).toBe(19);
  });

  it("should be able to resolve array values and their children, even if it is the same line.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "build.frontendDist.0")
    ).toBe(7);
  });
});
