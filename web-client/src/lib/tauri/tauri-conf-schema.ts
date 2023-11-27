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
import { TauriConfig } from "./config/tauri-conf";
import {
  parseTauriConfig,
  isValidConfig,
  isPartiallyValidConfig,
} from "./config/parse-tauri-config";
import { zodSchemaForVersion } from "./config/zod-schema-for-version";
import { getVersions } from "../connection/getters";
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

  const { connectionStore } = useConnection();
  const [entries] = awaitEntries(connectionStore.client.sources, "");

  const { monitorData } = useMonitor();

  const [tauriVersions] = getVersions(connectionStore.client.tauri);
  const tauriVersion = tauriVersions()?.tauri ?? "1";
  const zodSchema = zodSchemaForVersion(tauriVersion);

  return createResource(
    entries,
    async (entries) => {
      const filteredEntries = [
        "tauri.conf.json",
        "tauri.macos.conf.json",
        "tauri.linux.conf.json",
        "tauri.windows.conf.json",
      ];

      const configurations = (
        await readListOfConfigurations(
          filteredEntries,
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
          raw: safeJsonStringify(monitorData.tauriConfig ?? {}),
        } satisfies ConfigurationObject,
        ...configurations,
      ];
    },
    {
      storage: createDeepConfigurationStoreSignal,
    }
  );
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

function safeParseJson(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}

function safeJsonStringify(object: Record<string, unknown>) {
  try {
    return JSON.stringify(object);
  } catch (e) {
    return "";
  }
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
        label: "File: " + entry,
        key: entry,
        path: entry,
        data:
          isValidConfig(parsedConfig) || isPartiallyValidConfig(parsedConfig)
            ? parsedConfig.data
            : undefined,
        error: !isValidConfig(parsedConfig) ? parsedConfig.error : undefined,
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

export function findLineNumberByNestedKeyInSource(
  jsonString: string,
  nestedKeyPath: string
): number {
  const lines = jsonString.split("\n");
  if (nestedKeyPath === "" || nestedKeyPath === undefined) return -1;
  const searchStack = nestedKeyPath.split(".");
  // Number of whitespaces used for indentation
  const Indent = 2;

  let currentLine = 1;
  const keyStack: string[] = [];
  const searchIndents: number[] = [0];
  let searchLevel = 0;

  let arrayCounter = 0;

  for (const line of lines) {
    const currentIndent = line.length - line.trimStart().length;
    // If a property is closed we move up a level
    if (keyStack.length > 0 && searchIndents[searchLevel] === currentIndent) {
      keyStack.pop();
      searchLevel--;
      searchIndents.pop();
      arrayCounter = 0;
    }

    // We make sure we only move into nested properties if the indent is correct
    if (
      searchIndents[searchLevel] === 0 ||
      searchIndents[searchLevel] + Indent === currentIndent ||
      searchIndents[searchLevel] + Indent + Indent === currentIndent
    ) {
      // If the search property matches we move down a level
      if (line.includes('"' + searchStack[searchLevel] + '":')) {
        keyStack.push(searchStack[searchLevel]);
        searchLevel++;
        searchIndents.push(currentIndent);
      }

      // If the search property is a number we are in an array and assume that we are in the correct spot and only have to search for the correct index
      if (Number.isInteger(parseInt(searchStack[searchLevel]))) {
        if (arrayCounter === parseInt(searchStack[searchLevel])) {
          keyStack.push(searchStack[searchLevel]);
          searchLevel++;
          searchIndents.push(currentIndent);
        } else {
          arrayCounter++;
        }
      }
    }

    if (keyStack.length === searchStack.length) {
      return currentLine;
    }
    currentLine++;
  }

  return -1; // Return -1 if the nested key is not found in the JSON string.
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
