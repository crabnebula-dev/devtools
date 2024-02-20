import { Location } from "../proto/common";
import { getFileNameFromPath } from "./get-file-name-from-path";

export function getFileLineFromLocation(location: Location | undefined) {
  if (!location || !location.file) return null;

  let line = getFileNameFromPath(location.file);

  if (location.line) line += `:${location.line}`;

  return line;
}
