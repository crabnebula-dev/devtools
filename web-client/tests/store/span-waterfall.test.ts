import { describe, expect, it } from "vitest";
import { Span } from "~/lib/connection/monitor";
import { updatedSpans } from "~/lib/span/update-spans";

const MOCK_SPAN: Span = {
  id: BigInt(7),
  metadataId: BigInt(2),
  fields: [],
  children: [],
  createdAt: undefined,
  enteredAt: undefined,
  exitedAt: undefined,
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

  it("should add `enterSpan` updates `entry.at`", () => {
    const enterSpan = {
      spanId: BigInt(7), // used to locate parent
      threadId: BigInt(11), // ?
      at: {
        seconds: BigInt(1),
        nanos: 0,
      },
    };

    const result = updatedSpans(
      [MOCK_SPAN],
      [
        {
          event: {
            oneofKind: "enterSpan",
            enterSpan,
          },
        },
      ]
    );

    expect(result[0].enteredAt).toEqual(enterSpan.at);
  });

  it("should add `exitSpan` updates `entry.at`", () => {
    const exitSpan = {
      spanId: BigInt(7), // used to locate parent
      threadId: BigInt(11), // ?
      at: {
        seconds: BigInt(1),
        nanos: 0,
      },
    };

    const result = updatedSpans(
      [MOCK_SPAN],
      [
        {
          event: {
            oneofKind: "exitSpan",
            exitSpan,
          },
        },
      ]
    );

    expect(result[0].enteredAt).toEqual(exitSpan.at);
  });

  it("should add `newSpan` without parent to root level", () => {
    const newSpan = {
      id: BigInt(3),
      metadataId: BigInt(20),
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

  it("should add `newSpan` to `children` when there is a parent", () => {
    const newSpan = {
      parent: BigInt(7),
      id: BigInt(3),
      metadataId: BigInt(20),
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

    expect(result[0].children[0].id).toEqual(newSpan.id);
    expect(result[0].children[0].fields[0].name).toEqual(
      newSpan.fields[0].name
    );
  });
});
