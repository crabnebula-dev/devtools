import { filterLogs } from "./filter-logs";
import { fakeMonitorData } from "./fixtures/monitor-data";
import { getLogMetadata } from "./get-log-metadata";

describe("Log Filter Function", () => {
  // This is a test, so `any` should be fine.
  const logs: any = fakeMonitorData.logs;

  it("should return all logs when no filter is applied", () => {
    const result = filterLogs(
      fakeMonitorData,
      { textContent: "", levels: [] },
      logs
    );
    expect(result).toEqual(logs);
  });

  it("should filter logs by text content", () => {
    const textContent = "someText";
    const expected = logs.filter((log: any) =>
      log.message.includes(textContent)
    );
    const result = filterLogs(
      fakeMonitorData,
      { textContent, levels: [] },
      logs
    );
    expect(result).toEqual(expected);
  });

  // ... more tests for each level
  for (let level = 0; level <= 4; level++) {
    it(`should filter logs by level ${level}`, () => {
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

  // ... tests for combined text content and levels
  for (let level = 0; level <= 4; level++) {
    it(`should filter logs by text content and level ${level}`, () => {
      const textContent = "someText";
      const expected = logs.filter(
        (log: any) =>
          log.message.includes(textContent) &&
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
