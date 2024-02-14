export function findLineNumberByNestedKeyInSource(
  jsonString: string,
  nestedKeyPath: string,
): number {
  const lines = jsonString.split("\n");

  if (nestedKeyPath === "" || nestedKeyPath === undefined) return -1;

  const searchOptions = initSearchOptions(nestedKeyPath);

  for (const line of lines) {
    const currentIndent = calculateCurrentIndent(line);

    // If a property is closed we move up a level
    if (
      searchOptions.keyStack.length > 0 &&
      searchOptions.indents[searchOptions.level] === currentIndent
    ) {
      moveUp(searchOptions);
    }

    // We make sure we only move into nested properties if the indent is correct
    if (
      searchOptions.indents[searchOptions.level] === 0 ||
      searchOptions.indents[searchOptions.level] + searchOptions.indent ===
        currentIndent
    ) {
      if (lineHasProperty(searchOptions, line)) {
        moveDown(searchOptions, currentIndent);
      }

      if (
        lineHasOneLineArray(searchOptions, line) ||
        lineHasMultiLineArrayKey(searchOptions, line)
      ) {
        moveDown(searchOptions, currentIndent);
      }
    }

    if (searchOptions.keyStack.length === searchOptions.searchStack.length) {
      return searchOptions.currentLine;
    }

    searchOptions.currentLine++;
  }

  return -1; // Return -1 if the nested key is not found in the JSON string.
}

type SearchOptions = {
  searchStack: string[];
  indent: number;
  currentLine: number;
  keyStack: string[];
  indents: number[];
  level: number;
  arrayCounter: number;
  skippedFirstArray: boolean;
  hasMultilineArray: boolean;
};

function initSearchOptions(nestedKeyPath: string) {
  return {
    searchStack: nestedKeyPath.split("."),
    indent: 2,
    currentLine: 1,
    keyStack: [],
    indents: [0],
    level: 0,
    arrayCounter: 0,
    skippedFirstArray: false,
    hasMultilineArray: false,
  } satisfies SearchOptions;
}

function moveUp(searchOptions: SearchOptions) {
  searchOptions.keyStack.pop();
  searchOptions.level--;
  searchOptions.indents.pop();
  searchOptions.arrayCounter = 0;
}

function moveDown(searchOptions: SearchOptions, currentIndent: number) {
  searchOptions.keyStack.push(searchOptions.searchStack[searchOptions.level]);
  searchOptions.level++;
  searchOptions.indents.push(currentIndent);
}

function calculateCurrentIndent(line: string) {
  return line.length - line.trimStart().length;
}

function lineHasProperty(searchOptions: SearchOptions, line: string) {
  const { searchStack, level } = searchOptions;
  return line.includes('"' + searchStack[level] + '":');
}

function lineHasOneLineArray(searchOptions: SearchOptions, line: string) {
  const { searchStack, level } = searchOptions;
  // If the search property is a number we are in an array and assume that we are in the correct spot and only have to search for the correct index
  const arrayPointer = parseInt(searchStack[level]);
  if (Number.isInteger(arrayPointer)) {
    return line.includes("[") && line.includes("]");
  }
  return false;
}

function lineHasMultiLineArrayKey(
  searchOptions: SearchOptions,
  line: string,
): boolean {
  // If the search property is a number we are in an array and assume that we are in the correct spot and only have to search for the correct index
  const arrayPointer = parseInt(searchOptions.searchStack[searchOptions.level]);
  if (!Number.isInteger(arrayPointer)) return false;

  const isOneLineArray = line.includes("[") && line.includes("]");
  const isObjectClosing = line.includes("},");

  if (
    (searchOptions.arrayCounter === arrayPointer &&
      !isOneLineArray &&
      searchOptions.skippedFirstArray &&
      !isObjectClosing) ||
    isOneLineArray
  )
    return true;

  if (searchOptions.arrayCounter === 0 && !searchOptions.skippedFirstArray) {
    searchOptions.skippedFirstArray = true;
    return false;
  }

  if (!isObjectClosing) {
    searchOptions.arrayCounter++;
  }

  return false;
}
