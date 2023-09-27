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
