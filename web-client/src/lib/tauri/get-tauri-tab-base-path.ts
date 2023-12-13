import { useLocation } from "@solidjs/router";

const tauriTabUrlKey = "tauri";

export function getTauriTabBasePath() {
  const { pathname } = useLocation();
  return getRootPathByUrlSegment(pathname, tauriTabUrlKey);
}

export function getRootPathByUrlSegment(path: string, segment: string) {
  return path
    .split("/")
    .slice(
      0,
      path.split("/").findIndex((e) => e === segment)
    )
    .concat(segment)
    .join("/");
}
