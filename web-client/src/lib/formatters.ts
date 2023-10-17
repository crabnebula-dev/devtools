import { Timestamp } from "../../generated/google/protobuf/timestamp";

export function timestampToDate(ts: Timestamp): Date {
  return new Date(Number(ts.seconds * 1000n) + (ts.nanos / 1e6))
}

function formatMs(ms: string) {
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
