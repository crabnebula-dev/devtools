import { describe, expect, it } from "vitest";
import { Span } from "~/lib/connection/monitor";
import { updatedSpans } from "~/lib/span/update-spans";

const MOCK_SPAN: Span = {
  id: BigInt(7),
  metadataId: BigInt(2),
  fields: [],
  createdAt: -1,
  closedAt: -1,
  duration: -1,
  enters: [],
  exits: [],
};

describe("The store setter for the Span Waterfall", () => {
  it("should throw if an invalid span type is received", () => {
    expect(() => {
      updatedSpans(
        [MOCK_SPAN],
        [
          {
            event: {
              oneofKind: undefined,
            },
          },
        ]
      );
    }).toThrowError("span type not supported");
  });

  it("should do nothing for `closeSpan`", () => {
    const result = updatedSpans(
      [MOCK_SPAN],
      [
        {
          event: {
            oneofKind: "closeSpan",
            closeSpan: {
              spanId: BigInt(10),
              at: {
                seconds: BigInt(1),
                nanos: 0,
              },
            },
          },
        },
      ]
    );

    expect(result).toEqual([MOCK_SPAN]);
  });

  it("should add `newSpan` without parent to root level", () => {
    const newSpan = {
      id: BigInt(3),
      metadataId: BigInt(20),
      at: {
        seconds: BigInt(1),
        nanos: 0,
      },
      fields: [
        {
          metadataId: BigInt(200),
          name: "new span event" as const,
          value: {
            oneofKind: "debugVal" as const,
            debugVal: "hello" as const,
          },
        },
      ],
    };

    const result = updatedSpans(
      [MOCK_SPAN],
      [
        {
          event: {
            oneofKind: "newSpan",
            newSpan,
          },
        },
      ]
    );

    expect(result[1].id).toEqual(newSpan.id);
    expect(result[1].fields[0].name).toEqual(newSpan.fields[0].name);
  });
});
