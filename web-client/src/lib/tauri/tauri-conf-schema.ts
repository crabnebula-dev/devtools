import tauriConfigSchemaV1 from "./tauri-conf-schema-v1.json";
import tauriConfigSchemaV2 from "./tauri-conf-schema-v2.json";
import { Draft07, JsonSchema, JsonPointer } from "json-schema-library";
import { createResource } from "solid-js";
import { useRouteData } from "@solidjs/router";
import { Connection } from "~/lib/connection/transport.ts";
import {
  awaitEntries,
  getEntryBytes
} from "~/lib/sources/file-entries";

const TEXT_DECODER = new TextDecoder();

export function retrieveConfigurations() {
  const { client } = useRouteData<Connection>();
  const [entries] = awaitEntries(client.sources, "");

  return createResource(entries, async (entries) => {
    const filteredEntries =
      entries?.filter((e) => e.path.endsWith(".conf.json")) || [];
    return await Promise.all(
      filteredEntries.map(async (e) => {
        const bytes = await getEntryBytes(
          client.sources,
          e.path,
          Number(e.size)
        );
        const text = TEXT_DECODER.decode(bytes);
        const data = JSON.parse(text);
        delete data["$schema"];
        return { path: e.path, data: data ?? {}, size: Number(e.size) };
      })
    );
  });
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

export function findLineNumberByNestedKey(
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
