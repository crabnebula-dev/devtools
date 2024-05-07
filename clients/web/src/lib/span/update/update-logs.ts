import { LogEvent } from "~/lib/proto/logs";
import { convertTimestampToNanoseconds } from "~/lib/formatters";

export function updateLogs(prev: LogEvent[], update: LogEvent[]) {
  // HACK: ensure we're only inserting logs newer than the latest we already had.
  // Workaround for https://linear.app/crabnebula/issue/DT-121/bug-logs-are-duplicated-when-reconnecting
  const lastAddedAt = prev.length > 0 ? prev[prev.length - 1].at : null;

  const lastNs: number = lastAddedAt
    ? convertTimestampToNanoseconds(lastAddedAt)
    : 0;

  return [
    ...prev,
    ...update.filter(
      (log) => log.at && convertTimestampToNanoseconds(log.at) > lastNs,
    ),
  ];
}
