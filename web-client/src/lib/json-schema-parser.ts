import { Draft07, JsonSchema, JsonPointer } from "json-schema-library";

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
  const jsonSchema = new Draft07(baseSchema);
  const map = new Map();

  const buildMap = (
    schema: JsonSchema,
    value: unknown,
    pointer: JsonPointer
  ) => {
    //schema = jsonSchema.compileSchema(schema);
    pointer = pointer.replace("#/", "").replace("#", "").replaceAll("/", ".");
    console.log(pointer);
    map.set(pointer, schema);
  };

  jsonSchema.each(data, buildMap);

  return map;
}
