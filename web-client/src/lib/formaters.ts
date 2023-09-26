export function formatTimestamp(stamp: Date) {
  return `${stamp.getHours()}:${stamp.getMinutes()}:${stamp.getSeconds()}:${stamp.getMilliseconds()}`;
}
