import tauriConfigSchemaV1 from "./tauri-conf-schema-v1.json";
import tauriConfigSchemaV2 from "./tauri-conf-schema-v2.json";

// version: semver
export function returnLatestSchemaForVersion(version: string) {
  version = version.split(".")[0];
  switch (version) {
    case "1":
      return tauriConfigSchemaV1;
    case "2":
      return tauriConfigSchemaV2;
    default:
      return tauriConfigSchemaV1;
  }
}
