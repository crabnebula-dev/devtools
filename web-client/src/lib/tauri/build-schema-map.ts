import { Draft07, JsonSchema, JsonPointer } from "json-schema-library";

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
    map.set(pointer, schema);
  };

  jsonSchema.each(data, buildMap);

  return map;
}
