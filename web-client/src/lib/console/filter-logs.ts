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
) =>
  logs.filter((log) => {
    if (!filter.textContent && !filter.levels.length) return true;
    const level = getLogMetadata(monitorData, log)?.level;
    if (
      !filter.textContent &&
      filter.levels.length &&
      typeof level !== "undefined"
    )
      return filter.levels.includes(level);
    if (filter.textContent && filter.levels.length)
      return (
        log.message.includes(filter.textContent) &&
        typeof level !== "undefined" &&
        filter.levels.includes(level)
      );
    if (filter.textContent && !filter.levels.length)
      return log.message.includes(filter.textContent);
    return false;
  });
