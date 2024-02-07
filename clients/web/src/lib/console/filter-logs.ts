import { MonitorData } from "../connection/monitor";
import { getLogMetadata } from "./get-log-metadata";

export type LogFilterObject = {
  levels: number[];
  textContent: string;
};

export const filterLogs = (
  monitorData: MonitorData,
  filter: LogFilterObject,
  logs: MonitorData["logs"]
) => {
  if (!filter.textContent && !filter.levels.length) return logs;

  return logs.filter((log) => {
    if (!filter.textContent && !filter.levels.length) return true;

    const metadata = getLogMetadata(monitorData, log);
    const level = metadata?.level;
    const target = metadata?.target;
    const location = metadata?.location?.file;

    const matchesTextContent = filter.textContent
      ? log.message.includes(filter.textContent) ||
        target?.includes(filter.textContent) ||
        location?.includes(filter.textContent)
      : true;

    const matchesLevel =
      filter.levels.length && typeof level !== "undefined"
        ? filter.levels.includes(level)
        : true;

    return matchesTextContent && matchesLevel;
  });
};
