import {
  convertTimestampToNanoseconds,
  formatMs,
  formatTimestamp,
  getTime,
  timestampToDate,
} from "../../formatters";

describe("formatters", () => {
  it("should convertTimestampToNanoseconds", () => {
    expect(
      convertTimestampToNanoseconds({
        seconds: BigInt(1),
        nanos: 0,
      }),
    ).toMatchInlineSnapshot("1000000000");
  });
  it("should formatMs", () => {
    expect(formatMs("143")).toMatchInlineSnapshot('"143"');
  });
  it("should formatTimestamp", () => {
    expect(
      formatTimestamp(new Date("2019-08-19T00:00:00")),
    ).toMatchInlineSnapshot('"24:00:00:000"');
  });
  it("should getTime", () => {
    expect(getTime(new Date("2019-08-19T00:00:00"))).toMatchInlineSnapshot(
      '"24:00:00"',
    );
  });
  it("should timestampToDate", () => {
    expect(
      timestampToDate({
        seconds: BigInt(1),
        nanos: 0,
      }),
    ).toMatchInlineSnapshot("1970-01-01T00:00:01.000Z");
  });
});
