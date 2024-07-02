import type { Timestamp } from "~/lib/proto/google/protobuf/timestamp";

export function timestampToDate(ts: Timestamp): Date {
  return new Date(Number(ts.seconds * 1000n) + ts.nanos / 1e6);
}

export function convertTimestampToNanoseconds(timestamp: Timestamp): number {
  return Number(timestamp.seconds) * 1e9 + timestamp.nanos;
}

export function formatMs(ms: string) {
  switch (ms.length) {
    case 1:
      return "00" + ms;
    case 2:
      return "0" + ms;
    default:
      return ms;
  }
}

export function formatTimestamp(stamp: Date) {
  return `${stamp.toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })}:${formatMs(String(stamp.getMilliseconds()))}`;
}

export function getTime(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    second: "2-digit",
  }).format(date);
}

export function getDetailedTime(date: Date) {
  return Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    second: "2-digit",
    fractionalSecondDigits: 3,
  }).format(date);
}

export function getRootPathByUrlSegment(path: string, segment: string) {
  return path
    .split("/")
    .slice(
      0,
      path.split("/").findIndex((e) => e === segment),
    )
    .concat(segment)
    .join("/");
}

/** adds zero-width spaces to make entries break-able */
export function makeBreakable(path: string) {
  return path.replace(/([_/\\:]+|[^_/\\:]{20}|[a-z](?:[A-Z]))/g, "$1\u200b");
}

export function shortenFilePath(fullPath: string): string {
  return fullPath.substring(fullPath.lastIndexOf("\\") + 1);
}

export function shortenLogFilePath(path: string) {
  const sep = /[/\\]/.exec(path)?.[0] === "\\" ? "\\\\" : "/";
  const expr = new RegExp(`.*(${sep}.*?${sep}src.*$)`);
  return path.replace(expr, "…$1");
}
