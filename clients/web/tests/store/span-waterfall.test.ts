import { Span } from "~/lib/connection/monitor";
import { updatedSpans } from "~/lib/span/update-spans";
import { ReactiveMap } from "@solid-primitives/map";
import { MOCK_METADATA } from "./span-metadata.test";
import type { Metadata } from "~/lib/proto/common";

const MOCK_SPANS: ReactiveMap<bigint, Span> = new ReactiveMap();
const MOCK_MAP: Map<bigint, Metadata> = new Map([[BigInt(1), MOCK_METADATA()]]);

MOCK_SPANS.set(BigInt(7), {
  id: BigInt(7),
  name: "",
  metadataId: BigInt(2),
  fields: [],
  initiated: -1,
  time: -1,
  createdAt: -1,
  closedAt: -1,
  duration: -1,
  children: [],
  aborted: false,
  enters: [],
  exits: [],
});

describe("The store setter for the Span Waterfall", () => {
  it("should throw if an invalid span type is received", () => {
    expect(() => {
      updatedSpans(
        MOCK_SPANS,
        [
          {
            event: {
              oneofKind: undefined,
            },
          },
        ],
        MOCK_MAP,
        { end: -1, average: -1, counted: 0, openSpans: 0 },
      );
    }).toThrowError("span type not supported");
  });

  it("should do nothing for `closeSpan`", () => {
    const sizeBeforeUpdate = MOCK_SPANS.size;
    updatedSpans(
      MOCK_SPANS,
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
      ],
      MOCK_MAP,
      { end: -1, average: -1, counted: 0, openSpans: 0 },
    );

    expect(sizeBeforeUpdate).toEqual(MOCK_SPANS.size);
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

    updatedSpans(
      MOCK_SPANS,
      [
        {
          event: {
            oneofKind: "newSpan",
            newSpan,
          },
        },
      ],
      MOCK_MAP,
      { end: -1, average: -1, counted: 0, openSpans: 0 },
    );
    const result: Span[] = [];
    MOCK_SPANS.forEach((span) => result.push(span));
    expect(result[1].id).toEqual(newSpan.id);
    expect(result[1].fields[0].name).toEqual(newSpan.fields[0].name);
  });
});
