import { findLineNumberByNestedKeyInSource } from "../find-line-number-by-nested-key-in-source";
import fs from "fs";

const validConfig = fs.readFileSync(
  "./src/lib/tauri/tests/fixtures/valid-config.json",
  "utf-8"
);

describe("findLineNumberByNestedKey", () => {
  it("should be able to find top level keys.", () => {
    expect(findLineNumberByNestedKeyInSource(validConfig, "tauri")).toBe(13);
  });

  it("should be able to find deeply nested keys.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "tauri.bundle.active")
    ).toBe(15);
  });

  it("should not break when the key is not in the config.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "tauri.windows.bogus")
    ).toBe(-1);
  });

  it("should be able to resolve array values.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "tauri.bundle.icon.2")
    ).toBe(21);
  });

  it("should be able to resolve array values and their children.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "tauri.windows.0.height")
    ).toBe(43);
  });

  it("should be able to resolve array values and their children, even if it is the same line.", () => {
    expect(
      findLineNumberByNestedKeyInSource(validConfig, "build.distDir.0")
    ).toBe(4);
  });
});
