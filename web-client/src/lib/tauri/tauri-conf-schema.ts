import tauriConfigSchemaV1 from "./config/tauri-conf-schema-v1.json";
import tauriConfigSchemaV2 from "./config/tauri-conf-schema-v2.json";
import { Draft07, JsonSchema, JsonPointer } from "json-schema-library";
import { createResource, Signal } from "solid-js";
import { useLocation, useParams } from "@solidjs/router";
import { awaitEntries, getEntryBytes } from "~/lib/sources/file-entries";
import { useConfiguration } from "~/components/tauri/configuration-context";
import { unwrap, reconcile } from "solid-js/store";
import { bytesToText } from "../code-highlight";
import type { SourcesClient } from "../proto/sources.client";
import { useConnection } from "~/context/connection-provider";
import { useMonitor } from "~/context/monitor-provider";
import { safeStringifyJson, safeParseJson } from "../safe-json";
import { TauriConfig } from "./config/tauri-conf";
import {
  parseTauriConfig,
  isValidConfig,
  isPartiallyValidConfig,
} from "./config/parse-tauri-config";
import { zodSchemaForVersion } from "./config/zod-schema-for-version";
import { getVersions } from "../connection/getters";
import { z } from "zod";
import { findLineNumberByNestedKeyInSource } from "./find-line-number-by-nested-key-in-source";

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

export function getTauriTabBasePath() {
  const { pathname } = useLocation();
  return pathname
    .split("/")
    .slice(
      0,
      pathname.split("/").findIndex((e) => e === "tauri")
    )
    .concat("tauri")
    .join("/");
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

export function getDescriptionByKey(key: string) {
  const {
    descriptions: { descriptions },
  } = useConfiguration();
  return descriptions().has(key) ? descriptions().get(key) : undefined;
}

export function scrollToHighlighted() {
  const highlightedLine = document.querySelector(".line.highlighted");

  if (!highlightedLine) return;

  highlightedLine.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function findLineNumberByKey(key: string) {
  const params = useParams<{ config: string }>();
  const config = retrieveConfigurationByKey(params.config);
  return findLineNumberByNestedKeyInSource(config?.raw ?? "", key);
}

export function generateDescriptions(key: string, data: object) {
  const { monitorData } = useMonitor();

  const {
    descriptions: { setDescriptions },
  } = useConfiguration();

  setDescriptions(
    buildSchemaMap(monitorData.schema ?? {}, {
      [key]: data,
    })
  );
}

export function buildSchemaMap(baseSchema: JsonSchema, data: object) {
  const jsonSchema = new Draft07(baseSchema);
  const map = new Map();

  const buildMap = (
    schema: JsonSchema,
    value: unknown,
    pointer: JsonPointer
  ) => {
    //schema = jsonSchema.compileSchema(schema);
    pointer = pointer.replace("#/", "").replace("#", "").replaceAll("/", ".");
    map.set(pointer, schema);
  };

  jsonSchema.each(data, buildMap);

  return map;
}
