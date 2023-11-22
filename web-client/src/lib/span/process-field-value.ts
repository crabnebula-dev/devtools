import { Field } from "../proto/common";

function processFieldValue(field: Field["value"]): string {
  switch (field.oneofKind) {
    case "debugVal":
      return field.debugVal;
    case "strVal":
      return field.strVal;
    case "u64Val":
      return String(field.u64Val);
    case "i64Val":
      return String(field.i64Val);
    case "boolVal":
      return String(field.boolVal);
    case "doubleVal":
      return String(field.doubleVal);
    default:
      throw new Error(`Unknown field type: ${field.oneofKind}`);
  }
}

export { processFieldValue };
