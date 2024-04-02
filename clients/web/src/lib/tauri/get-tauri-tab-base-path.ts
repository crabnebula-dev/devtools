import { useLocation } from "@solidjs/router";
import { getRootPathByUrlSegment } from "../get-root-path-by-url-segment";

export function getTauriTabBasePath() {
  const { pathname } = useLocation();
  return getRootPathByUrlSegment(pathname, "tauri");
}
