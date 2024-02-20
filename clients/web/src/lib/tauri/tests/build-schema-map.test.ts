import tauriConfSchemaV1 from "../config/tauri-conf-schema-v1.json";
import { buildSchemaMap } from "../build-schema-map";

describe("buildSchemaMap", () => {
  it("Should be able return the a schema for a top level key", () => {
    expect(
      buildSchemaMap(tauriConfSchemaV1, {
        tauri: {},
      }).has("tauri"),
    ).toBe(true);
  });

  it("Should be able return the correct schema for a top level key", () => {
    expect(
      buildSchemaMap(tauriConfSchemaV1, {
        tauri: {},
      }).get("tauri")?.description,
    ).toBe("The Tauri configuration.");
  });

  it("Should be able return the correct schema for a nested key", () => {
    expect(
      buildSchemaMap(tauriConfSchemaV1, {
        tauri: {
          pattern: {
            use: "brownfield",
          },
        },
      }).get("tauri.pattern")?.description,
    ).toBe("The pattern to use.");
  });

  it("Should be able return the correct schema for complex keys", () => {
    expect(
      buildSchemaMap(tauriConfSchemaV1, {
        tauri: {
          windows: [
            {
              title: "Welcome to Tauri!",
              width: 800,
              height: 600,
              resizable: true,
              fullscreen: false,
            },
          ],
        },
      }).get("tauri.windows.0.title")?.description,
    ).toBe("The window title.");
  });
});
