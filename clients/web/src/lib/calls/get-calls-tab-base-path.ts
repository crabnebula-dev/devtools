import { useLocation } from "@solidjs/router";
import { getRootPathByUrlSegment } from "../formatters";

export function getCallsTabBasePath() {
  const { pathname } = useLocation();
  return getRootPathByUrlSegment(pathname, "calls");
}
