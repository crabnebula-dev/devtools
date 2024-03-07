import { getEntryBytes } from "~/lib/sources/file-entries";
import { bytesToText } from "~/lib/code-highlight";
import type { SourcesClient } from "~/lib/proto/sources.client";
import { useConnection } from "~/context/connection-provider";
import { useMonitor } from "~/context/monitor-provider";
import { TauriConfig } from "./tauri-conf";
import {
  parseTauriConfig,
  isValidConfig,
  isPartiallyValidConfig,
} from "./parse-tauri-config";
import { zodSchemaForVersion } from "./zod-schema-for-version";
import { safeStringifyJson, safeParseJson } from "~/lib/safe-json";
import { z } from "zod";
import { Versions } from "~/lib/proto/tauri";

export type ConfigurationStore = {
  configs?: ConfigurationObject[];
};

export type ConfigurationObject = {
  label: string;
  key: string;
  path: string;
  data?: TauriConfig;
  error?: z.ZodError<TauriConfig>;
  size: number;
  raw: string;
};

export const possibleConfigurationFiles = [
  "tauri.conf.json",
  "tauri.macos.conf.json",
  "tauri.linux.conf.json",
  "tauri.windows.conf.json",
];

export function retrieveConfigurationByKey(key: string) {
  const { monitorData } = useMonitor();
  return monitorData.tauriConfigStore?.configs?.find(
    (config) => config?.key === key,
  );
}

export async function loadConfigurations(
  tauriConfig:
    | Record<"package" | "plugins" | "tauri" | "build", object>
    | undefined,
  tauriVersions: Versions,
) {
  const { connectionStore } = useConnection();
  const tauriVersion = tauriVersions?.tauri ?? "1";
  const zodSchema = zodSchemaForVersion(tauriVersion);

  const configurations = (
    await readListOfConfigurations(
      possibleConfigurationFiles,
      connectionStore.client.sources,
      zodSchema,
    )
  ).filter(notEmpty);

  const loadedConfiguration = parseTauriConfig(tauriConfig ?? {}, zodSchema);

  return [
    {
      label: "Loaded configuration",
      key: "loaded",
      path: "",
      size: 0,
      data:
        isValidConfig(loadedConfiguration) ||
        isPartiallyValidConfig(loadedConfiguration)
          ? loadedConfiguration.data
          : undefined,
      raw: safeStringifyJson(tauriConfig ?? {}) ?? "",
    } satisfies ConfigurationObject,
    ...configurations,
  ];
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

async function readListOfConfigurations(
  entries: string[],
  client: SourcesClient,
  zodSchema: z.ZodType<TauriConfig, z.ZodTypeDef, unknown>,
) {
  return await Promise.all(
    entries.map(async (entry): Promise<ConfigurationObject | null> => {
      let bytes;
      try {
        bytes = await getEntryBytes(client, entry, 0);
      } catch (e) {
        return null;
      }

      const text = bytesToText(bytes);
      const rawData = safeParseJson(text);
      const parsedConfig = parseTauriConfig(rawData, zodSchema);

      return {
        label: entry,
        key: entry,
        path: entry,
        data:
          isValidConfig(parsedConfig) || isPartiallyValidConfig(parsedConfig)
            ? parsedConfig.data
            : undefined,
        error: isPartiallyValidConfig(parsedConfig)
          ? parsedConfig.error
          : undefined,
        size: 0,
        raw: text,
      } satisfies ConfigurationObject;
    }),
  );
}
