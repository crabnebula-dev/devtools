import { DEV } from "solid-js";

export function safeParseJson(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    if (DEV) {
      console.error(
        `Failed to safely parse the following value to json: `,
        jsonString,
        e,
      );
    }
    return undefined;
  }
}

export function safeStringifyJson(object: Record<string, unknown>) {
  try {
    return JSON.stringify(object);
  } catch (e) {
    if (DEV) {
      console.error(
        `Failed to safely json stringify the following value: `,
        object,
        e,
      );
    }
    return undefined;
  }
}
