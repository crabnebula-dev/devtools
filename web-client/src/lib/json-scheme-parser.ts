export function buildSchemaMap(baseSchema, data) {
  console.log(baseSchema);

  let map = new Map();
  flattenLevel("", baseSchema.definitions, map, baseSchema.definitions, data);
  console.log("Map", map);
  return map;
}

function flattenLevel(parentKey, schema, map, baseSchema, data) {
  for (const key in schema) {
    if (
      schema.hasOwnProperty(key) &&
      (data === null || data.hasOwnProperty(configToSchemaKey(key)))
    ) {
      let fullKey = parentKey + (parentKey === "" ? "" : ".") + key;

      map.set(fullKey, {
        description: schema[key].description,
      });

      if (schema[key].hasOwnProperty("properties")) {
        flattenLevel(fullKey, schema[key].properties, map, baseSchema, null);
      }

      if (schema[key].hasOwnProperty("allOf")) {
        for (const element of schema[key].allOf) {
          if (element.hasOwnProperty("$ref")) {
            let allOfKey = element["$ref"].replace("#/definitions/", "");
            console.log("allOfKey", allOfKey);
            console.log("baseSchema", baseSchema);
            let allOfSchema = baseSchema[allOfKey];
            console.log("allOfSchema", allOfSchema);
            flattenLevel(
              fullKey,
              allOfSchema.properties,
              map,
              baseSchema,
              null
            );
          }
        }
      }

      if (schema[key].hasOwnProperty("anyOf")) {
        for (const element of schema[key].anyOf) {
          if (element.hasOwnProperty("$ref")) {
            let allOfKey = element["$ref"].replace("#/definitions/", "");
            let allOfSchema = baseSchema[allOfKey];
            flattenLevel(
              fullKey,
              allOfSchema.properties,
              map,
              baseSchema,
              null
            );
          }
        }
      }
    }
  }

  return map;
}

function configToSchemaKey(key: string) {
  return key.replace("Config", "").toLowerCase();
}

export function findFieldDefinitionByKeyInScheme(
  key: string,
  baseScheme: object
) {
  let schemaKeys = key.split(".");

  let tab = schemaKeys.shift();

  if (tab === undefined) return null;

  let schema = findTopLevelConfig(tab, baseScheme);

  for (const element of schemaKeys) {
    if (schema.hasOwnProperty("type")) {
      switch (schema.type) {
        case "array":
          if (!schema.items.hasOwnProperty("$ref")) break;
          let allOfKey = schema.items["$ref"].replace("#/definitions/", "");
          schema = findTopLevelConfig(allOfKey, baseScheme);
          break;
        case "object":
          schema = schema.properties[element];
          break;
      }
    }

    // If the schema has an allOf object, and the first element of that object is a reference to a definition, then we can use that as the schema
    if (
      !schema.hasOwnProperty("type") &&
      (schema.hasOwnProperty("allOf") || schema.hasOwnProperty("anyOf")) &&
      schema.allOf.length > 0 &&
      schema.allOf[0]["$ref"].includes("#/definitions/")
    ) {
      let allOfKey = schema.allOf[0]["$ref"].replace("#/definitions/", "");
      console.log("AllOfKey", allOfKey);
      schema = findTopLevelConfig(allOfKey, baseScheme);
    }
  }

  if (!schema.hasOwnProperty("description")) return null;

  console.log("Found", schema);
  return schema;
}

function findTopLevelConfig(key: string, baseScheme: object) {
  key = key.charAt(0).toUpperCase() + key.slice(1);

  if (baseScheme.hasOwnProperty(key)) {
    return baseScheme[key];
  }

  key += "Config";
  if (!baseScheme.hasOwnProperty(key)) return null;
  return baseScheme[key];
}
