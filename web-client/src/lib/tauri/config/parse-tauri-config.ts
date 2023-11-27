import { z } from "zod";
import { SafeParseError, SafeParseSuccess, ZodIssue } from "zod";
import type { TauriConfig } from "./tauri-conf";

export function parseTauriConfig<Schema extends z.ZodTypeAny>(
  configData: JSONValue,
  schema: Schema
) {
  const config = schema.safeParse(configData);

  /* If the first parse returns errors we try to strip the configData of the faulty values and get a partially parsed configuration */
  if (!config.success) return parseErrorConfig(configData, config, schema);

  return config;
}

interface PartialSafeParseSuccess extends SafeParseSuccess<TauriConfig> {
  error?: z.ZodError<TauriConfig>;
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
  /* Create a temporary object with the corrupt data */
  const errorData = structuredClone(configData);

  const fieldErrors = parsed.error.errors;

  /* Remove all the fields with errors */
  fieldErrors.forEach((error) => {
    if (error.code === "unrecognized_keys")
      return deleteUnrecognizedKey(errorData, error.path, error.keys);

    deleteErrorKey(errorData, error);
  });

  const strippedConfig = schema.parse(errorData);

  /* When our incoming data is empty after stripping invalid keys we invalidate the result */
  return Object.keys(errorData).length === 0
    ? ({
        success: false,
        /* We return the original error */
        error: parsed.error,
      } satisfies SafeParseError<TauriConfig>)
    : ({
        success: true,
        data: strippedConfig.data,
        /* We return the original error's */
        error: parsed.error,
      } satisfies PartialSafeParseSuccess);
}

function isJsonObject(value: JSONValue): value is JSONObject {
  if (!value) return false;

  return !Array.isArray(value) && typeof value === "object";
}

export function isValidConfig<T>(
  value: PartialSafeParseSuccess | SafeParseSuccess<T> | SafeParseError<T>
): value is SafeParseSuccess<T> {
  return "data" in value && !("error" in value);
}

export function isPartiallyValidConfig<T>(
  value: PartialSafeParseSuccess | SafeParseSuccess<T> | SafeParseError<T>
): value is PartialSafeParseSuccess {
  return "data" in value && "error" in value;
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
