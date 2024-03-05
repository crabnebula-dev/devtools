import { getLogMetadata } from "~/lib/console/get-log-metadata";
import { timestampToDate } from "~/lib/formatters";
import { getLevelClasses } from "~/lib/console/get-level-classes";
import { useMonitor } from "~/context/monitor-provider";
import { processFieldValue } from "~/lib/span/process-field-value";
import { LogEvent } from "../proto/logs";

export function processLogEventForView(logEvent: LogEvent) {
  const { monitorData } = useMonitor();
  const { message, at } = logEvent;
  if (!at) return;

  const metadata = getLogMetadata(monitorData, logEvent);
  const timeDate = timestampToDate(at);
  const levelStyle = getLevelClasses(metadata?.level);

  let target = metadata?.target;
  if (target === "log") {
    const field = logEvent.fields.find((field) => field.name === "log.target");
    if (field) {
      target = processFieldValue(field.value);
    }
  }

  return {
    timeDate,
    message,
    levelStyle,
    target,
    metadata,
  };
}
