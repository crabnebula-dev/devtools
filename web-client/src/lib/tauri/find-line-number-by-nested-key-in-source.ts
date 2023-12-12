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
  let skippedFirstArray = false;

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
      searchIndents[searchLevel] + Indent === currentIndent
    ) {
      // If the search property matches we move down a level
      if (
        lineHasProperty(line, searchStack, searchLevel) ||
        lineHasOneLineArray(line, searchStack, searchLevel)
      ) {
        keyStack.push(searchStack[searchLevel]);
        searchLevel++;
        searchIndents.push(currentIndent);
      }

      // If the search property is a number we are in an array and assume that we are in the correct spot and only have to search for the correct index
      const arrayPointer = parseInt(searchStack[searchLevel]);
      if (Number.isInteger(arrayPointer)) {
        const isOneLineArray = line.includes("[") && line.includes("]");
        const isObjectClosing = line.includes("},");

        if (
          (arrayCounter === arrayPointer &&
            !isOneLineArray &&
            skippedFirstArray &&
            !isObjectClosing) ||
          isOneLineArray
        ) {
          keyStack.push(searchStack[searchLevel]);
          searchLevel++;
          searchIndents.push(currentIndent);
        } else {
          if (arrayCounter === 0 && !skippedFirstArray) {
            skippedFirstArray = true;
          } else {
            if (!isObjectClosing) {
              arrayCounter++;
            }
          }
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

function lineHasProperty(
  line: string,
  searchStack: string[],
  searchLevel: number
) {
  return line.includes('"' + searchStack[searchLevel] + '":');
}

function lineHasOneLineArray(
  line: string,
  searchStack: string[],
  searchLevel: number
) {
  // If the search property is a number we are in an array and assume that we are in the correct spot and only have to search for the correct index
  const arrayPointer = parseInt(searchStack[searchLevel]);
  if (Number.isInteger(arrayPointer)) {
    return line.includes("[") && line.includes("]");
  }
  return false;
}
