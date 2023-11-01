import { Draft07, JsonSchema } from "json-schema-library";

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
  let keyStack: string[] = [];
  let searchIndents: number[] = [0];
  let searchLevel = 0;

  let arrayCounter = 0;

  for (let line of lines) {
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
  let map = new Map();

  const jsonSchema = new Draft07(baseSchema);

  setChild(data, map, baseSchema, "", jsonSchema);

  return map;
}

function setChild(
  data: object,
  map: Map<string, any>,
  schema: JsonSchema,
  parentKey = "",
  baseSchema: JsonSchema
) {
  for (const [key, value] of Object.entries(data)) {
    let localSchema = baseSchema.step(key, schema, { [key]: value });

    // The json-schema-library returns a schema with a single $ref property for arrays so we need to get the actual schema
    if (
      Object.entries(localSchema).length === 1 &&
      localSchema.hasOwnProperty("$ref")
    ) {
      localSchema =
        baseSchema.getSchema().definitions[
          localSchema["$ref"].replace("#/definitions/", "")
        ];
    }

    // The library also does not step into allof schemas so we need to do that manually
    if (localSchema.hasOwnProperty("allOf")) {
      for (const schema of localSchema.allOf) {
        if (schema.hasOwnProperty("$ref")) {
          const refSchema =
            baseSchema.getSchema().definitions[
              schema["$ref"].replace("#/definitions/", "")
            ];
          localSchema = refSchema;
        } else {
          localSchema = schema;
        }
      }
    }

    const fullKey = parentKey !== "" ? parentKey + "." + key : key;
    map.set(fullKey, localSchema);

    if (typeof value !== "object" || value === null) continue;

    setChild(value, map, localSchema, fullKey, baseSchema);
  }
  return;
}
