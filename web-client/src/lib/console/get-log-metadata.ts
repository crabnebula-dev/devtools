import { MonitorData } from "../connection/monitor";
import { LogEvent } from "../proto/logs";

export const getLogMetadata = (monitorData: MonitorData, message: LogEvent) =>
  monitorData.metadata.get(message.metadataId);
