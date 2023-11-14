import { DEV } from "solid-js";

export function getArrayFromLocalStorage(
  key: string,
  defaultValue = [200, 800] satisfies [number, number]
): [number, number] {
  if (window.localStorage) {
    const stringArray =
      window.localStorage.getItem(key) || JSON.stringify(defaultValue);

    try {
      return JSON.parse(stringArray);
    } catch (e) {
      if (DEV) {
        console.error(
          `SplitPane:: Failed to parse array ${key} from localStorage with value ${stringArray}`,
          e
        );
      }
    }
  }

  return defaultValue;
}

export function setToLocalStorage(key: string, value: unknown) {
  if (!window.localStorage) {
    if (DEV) {
      console.warn("SplitPane:: localStorage is not available");
    }
  } else {
    if (typeof value === "string") {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  return;
}
