import { useLocation } from "@solidjs/router";
import { getRootPathByUrlSegment } from "../formatters";

export function getTauriTabBasePath() {
  const { pathname } = useLocation();
  return getRootPathByUrlSegment(pathname, "tauri");
}
