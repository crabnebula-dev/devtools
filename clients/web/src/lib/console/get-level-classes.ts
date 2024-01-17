import { Metadata_Level } from "../proto/common";

export const getLevelClasses = (level: Metadata_Level | undefined) => {
  switch (level) {
    case 0:
      return "text-red-400 border-red-900";
    case 1:
      return "text-yellow-400 border-yellow-900";
    case 2:
      return "text-blue-400 border-blue-900";
    case 3:
      return "text-gray-500 border-gray-800";
    default:
      return "";
  }
};
