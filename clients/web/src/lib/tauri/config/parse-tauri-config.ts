import { z } from "zod";
import { SafeParseError, SafeParseSuccess, ZodIssue } from "zod";
import { TauriConfig } from "./tauri-conf";

export function parseTauriConfig(
  configData: JSONValue,
  schema: z.ZodType<TauriConfig, z.ZodTypeDef, unknown>,
) {
  const config = schema.safeParse(configData);

  /* If the first parse returns errors we try to strip the configData of the faulty values and get a partially parsed configuration */
  if (!config.success) return parseErrorConfig(configData, config, schema);

  return config;
}

interface PartialSafeParseSuccess<T> extends SafeParseSuccess<T> {
  error: z.ZodError<T>;
}

type JSONValue =
  | string
  | number
  | boolean
  | object
  | JSONObject
  | Array<JSONValue>;

interface JSONObject {
  [key: string | number]: JSONValue;
}

function parseErrorConfig(
  configData: JSONValue,
  parsed: SafeParseError<TauriConfig>,
  schema: z.ZodType<TauriConfig, z.ZodTypeDef, unknown>,
):
  | z.SafeParseReturnType<TauriConfig, TauriConfig>
  | PartialSafeParseSuccess<TauriConfig> {
  /* Create a temporary object with the corrupt data */
  const errorData = structuredClone(configData);

  if (!isJsonObject(errorData)) {
    return {
      success: false,
      /* We return the original error */
      error: parsed.error,
    };
  }

  const fieldErrors = parsed.error.errors;

  /* Remove all the fields with errors */
  fieldErrors.forEach((error) => {
    if (error.code === "unrecognized_keys")
      return deleteUnrecognizedKey(errorData, error.path, error.keys);

    deleteErrorKey(errorData, error);
  });

  const strippedConfig = schema.safeParse(errorData);
  /* When our incoming data is empty after stripping invalid keys we invalidate the result */
  return Object.keys(errorData).length === 0 || !isValidConfig(strippedConfig)
    ? {
        success: false,
        /* We return the original error */
        error: parsed.error,
      }
    : {
        success: true,
        data: strippedConfig.data,
        /* We return the original error's */
        error: parsed.error,
      };
}

function isJsonObject(value: JSONValue): value is JSONObject {
  if (!value) return false;

  return !Array.isArray(value) && typeof value === "object";
}

function isJsonArray(value: JSONValue): value is Array<JSONValue> {
  if (!value) return false;

  return Array.isArray(value);
}

export function isValidConfig<T>(
  value: PartialSafeParseSuccess<T> | SafeParseSuccess<T> | SafeParseError<T>,
): value is SafeParseSuccess<T> {
  return "data" in value && !("error" in value);
}

export function isPartiallyValidConfig<T>(
  value: PartialSafeParseSuccess<T> | SafeParseSuccess<T> | SafeParseError<T>,
): value is PartialSafeParseSuccess<T> {
  return "data" in value && "error" in value;
}

function deleteUnrecognizedKey(
  object: JSONValue,
  path: (string | number)[],
  keys: string[],
) {
  path.forEach((path) => {
    if (isJsonObject(object) && Object.hasOwn(object, path))
      object = object[path];

    if (isJsonArray(object) && typeof path === "number") object = object[path];
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
      if (isJsonArray(object) && typeof path === "number")
        object = object[path];
    });
  }

  const deleteKey = error.path[error.path.length - 1];

  if (deleteKey && isJsonObject(object) && Object.hasOwn(object, deleteKey))
    delete object[deleteKey];
  if (
    deleteKey &&
    isJsonArray(object) &&
    typeof deleteKey === "number" &&
    Array.length > deleteKey
  )
    delete object[deleteKey];
}
