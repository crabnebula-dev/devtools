import { TauriConfigV1 } from "./tauri-conf-schema-v1-zod";
import { TauriConfigV2 } from "./tauri-conf-schema-v2-zod";

type TauriConfig = TauriConfigV1 | TauriConfigV2;
