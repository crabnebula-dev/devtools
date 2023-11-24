import { z } from "zod";
import { SafeParseError, SafeParseSuccess, ZodIssue } from "zod";
import type { TauriConfig } from "./tauri-conf";

export function parseTauriConfig<T extends z.ZodTypeAny>(
  configData: JSONValue,
  schema: T
) {
  const config = schema.safeParse(configData);

  /* If the first parse returns errors we try to strip the configData of the faulty values and get a partially parsed configuration */
  if (!config.success) return parseErrorConfig(configData, config, schema);

  return config;
}

type JSONValue = string | number | boolean | JSONObject | Array<JSONValue>;

interface JSONObject {
  [key: string | number]: JSONValue;
}

function parseErrorConfig<T extends z.ZodTypeAny>(
  configData: JSONValue,
  parsed: SafeParseError<T>,
  schema: T
) {
  const errorData = structuredClone(configData);

  const fieldErrors = parsed.error.errors;

  fieldErrors.forEach((error) => {
    if (error.code === "unrecognized_keys")
      return deleteUnrecognizedKey(errorData, error.path, error.keys);

    deleteErrorKey(errorData, error);
  });

  const defaultConfig = schema.parse({});
  const strippedConfig = schema.parse(errorData);

  return JSON.stringify(defaultConfig) === JSON.stringify(strippedConfig)
    ? ({
        success: false,
        error: parsed.error,
      } satisfies SafeParseError<TauriConfig>)
    : ({
        success: true,
        data: strippedConfig,
      } satisfies SafeParseSuccess<TauriConfig>);
}

function isJsonObject(value: JSONValue): value is JSONObject {
  if (!value) return false;

  return !Array.isArray(value) && typeof value === "object";
}

function deleteUnrecognizedKey(
  object: JSONValue,
  path: (string | number)[],
  keys: string[]
) {
  path.forEach((path) => {
    if (isJsonObject(object) && Object.hasOwn(object, path)) {
      object = object[path];
    }
  });
  keys.forEach((key) => {
    if (isJsonObject(object) && Object.hasOwn(object, key)) {
      delete object[key];
    }
  });
}

function deleteErrorKey(object: JSONValue, error: ZodIssue) {
  if (error.path.length > 1) {
    const paths = error.path.slice(0, error.path.length - 1);
    paths.forEach((path) => {
      if (isJsonObject(object) && Object.hasOwn(object, path))
        object = object[path];
    });
  }

  const deleteKey = error.path.pop();

  if (deleteKey && isJsonObject(object) && Object.hasOwn(object, deleteKey))
    delete object[deleteKey];
}
