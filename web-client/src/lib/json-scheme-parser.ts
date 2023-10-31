import { Draft07, JsonSchema } from "json-schema-library";

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

    const fullKey = parentKey !== "" ? parentKey + "." + key : key;
    map.set(fullKey, localSchema);

    if (typeof value !== "object" || value === null) continue;

    setChild(value, map, localSchema, fullKey, baseSchema);
  }
  return;
}
