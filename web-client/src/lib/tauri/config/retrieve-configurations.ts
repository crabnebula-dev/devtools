import { createResource, Signal } from "solid-js";
import { unwrap, reconcile } from "solid-js/store";
import { getEntryBytes } from "~/lib/sources/file-entries";
import { bytesToText } from "~/lib/code-highlight";
import type { SourcesClient } from "~/lib/proto/sources.client";
import { useConnection } from "~/context/connection-provider";
import { useConfiguration } from "~/components/tauri/configuration-context";
import { useMonitor } from "~/context/monitor-provider";
import { TauriConfig } from "./tauri-conf";
import {
  parseTauriConfig,
  isValidConfig,
  isPartiallyValidConfig,
} from "./parse-tauri-config";
import { zodSchemaForVersion } from "./zod-schema-for-version";
import { getVersions } from "~/lib/connection/getters";
import { safeStringifyJson, safeParseJson } from "~/lib/safe-json";
import { z } from "zod";

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
  const [configs] = retrieveConfigurations();
  return configs()?.find((config) => config?.key === key);
}

export function retrieveConfigurations() {
  const {
    configurations: { configurations },
  } = useConfiguration();

  if (configurations.configs)
    return createResource(() => configurations.configs);

  return createResource(loadConfigurations, {
    storage: createDeepConfigurationStoreSignal,
  });
}

async function loadConfigurations() {
  const { connectionStore } = useConnection();
  const { monitorData } = useMonitor();
  const [tauriVersions] = getVersions(connectionStore.client.tauri);
  const tauriVersion = tauriVersions()?.tauri ?? "1";
  const zodSchema = zodSchemaForVersion(tauriVersion);

  const configurations = (
    await readListOfConfigurations(
      possibleConfigurationFiles,
      connectionStore.client.sources,
      zodSchema
    )
  ).filter(notEmpty);

  const loadedConfiguration = parseTauriConfig(
    monitorData.tauriConfig ?? {},
    zodSchema
  );

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
      raw: safeStringifyJson(monitorData.tauriConfig ?? {}) ?? "",
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
  zodSchema: z.ZodType<TauriConfig, z.ZodTypeDef, unknown>
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
    })
  );
}

function createDeepConfigurationStoreSignal<T>(): Signal<T> {
  const {
    configurations: { configurations, setConfigurations },
  } = useConfiguration();
  return [
    () => configurations.configs,
    (v: T) => {
      const unwrapped = unwrap(configurations.configs);
      typeof v === "function" && (v = v(unwrapped));
      setConfigurations("configs", reconcile(v as ConfigurationObject[]));
      return configurations.configs;
    },
  ] as Signal<T>;
}
