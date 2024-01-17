/* Since this is a test with fake monitor data we don't care about the linter warnings */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { filterLogs } from "./filter-logs";
import { fakeMonitorData } from "./fixtures/monitor-data";
import { getLogMetadata } from "./get-log-metadata";

describe("Log Filter Function", () => {
  const logs: any = fakeMonitorData.logs;

  // Test with no filters
  it("should return all logs when no filter is applied", () => {
    const result = filterLogs(
      fakeMonitorData,
      { textContent: "", levels: [] },
      logs
    );
    expect(result).toEqual(logs);
  });

  // Test each level individually
  for (let level = 0; level <= 4; level++) {
    it(`should filter logs by level ${level} only`, () => {
      const expected = logs.filter(
        (log: any) => getLogMetadata(fakeMonitorData, log)?.level === level
      );
      const result = filterLogs(
        fakeMonitorData,
        { textContent: "", levels: [level] },
        logs
      );
      expect(result).toEqual(expected);
    });
  }

  // Test with each possible textContent
  const textContents = ["tauri", "hyper", "error"]; // Add more as needed
  textContents.forEach((textContent) => {
    it(`should filter logs by textContent '${textContent}'`, () => {
      const expected = logs.filter(
        (log: any) =>
          log.message.includes(textContent) ||
          getLogMetadata(fakeMonitorData, log)?.target?.includes(textContent) ||
          getLogMetadata(fakeMonitorData, log)?.location?.file?.includes(
            textContent
          )
      );
      const result = filterLogs(
        fakeMonitorData,
        { textContent, levels: [] },
        logs
      );
      expect(result).toEqual(expected);
    });

    // Combined tests with each level and textContent
    for (let level = 0; level <= 4; level++) {
      it(`should filter logs by textContent '${textContent}' and level ${level}`, () => {
        const expected = logs.filter(
          (log: any) =>
            (log.message.includes(textContent) ||
              getLogMetadata(fakeMonitorData, log)?.target?.includes(
                textContent
              ) ||
              getLogMetadata(fakeMonitorData, log)?.location?.file?.includes(
                textContent
              )) &&
            getLogMetadata(fakeMonitorData, log)?.level === level
        );
        const result = filterLogs(
          fakeMonitorData,
          { textContent, levels: [level] },
          logs
        );
        expect(result).toEqual(expected);
      });
    }
  });
});
