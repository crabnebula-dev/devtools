import { tauriConfigSchemaV1 } from "../config/tauri-conf-schema-v1-zod";
import { tauriConfigSchemaV2 } from "../config/tauri-conf-schema-v2-zod";
import validConfig from "./fixtures/valid-config.json";
import partiallyValidConfig from "./fixtures/partially-valid-config.json";
import brokenConfiguration from "./fixtures/broken-config.json";
import { parseTauriConfig } from "../config/parse-tauri-config";

describe("parseTauriConfig", () => {
  it("should be able to parse and validate a valid v1 tauri config", () => {
    expect(parseTauriConfig(validConfig, tauriConfigSchemaV1).success).toBe(
      true
    );
  });

  it("should be able to parse and validate a partially valid v1 tauri config", () => {
    expect(
      parseTauriConfig(partiallyValidConfig, tauriConfigSchemaV1).success
    ).toBe(true);
  });

  it("should be able to reject a completely broken v1 tauri config", () => {
    expect(
      parseTauriConfig(brokenConfiguration, tauriConfigSchemaV1).success
    ).toBe(false);
  });

  it("should be able to parse and validate a valid v2 tauri config", () => {
    expect(parseTauriConfig(validConfig, tauriConfigSchemaV2).success).toBe(
      true
    );
  });

  it("should be able to parse and validate a partially valid v2 tauri config", () => {
    expect(
      parseTauriConfig(partiallyValidConfig, tauriConfigSchemaV2).success
    ).toBe(true);
  });

  it("should be able to reject a completely broken v2 tauri config", () => {
    expect(
      parseTauriConfig(brokenConfiguration, tauriConfigSchemaV2).success
    ).toBe(false);
  });
});
