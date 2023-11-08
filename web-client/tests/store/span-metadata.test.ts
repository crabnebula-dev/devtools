import { describe, expect, it } from "vitest";
import {
  type Metadata,
  Metadata_Kind,
  Metadata_Level,
} from "~/lib/proto/common";
import { updateSpanMetadata } from "~/lib/span/update-span-metadata";

const MOCK_METADATA = (
  kind = Metadata_Kind.SPAN,
  level = Metadata_Level.INFO
) => ({
  name: "test",
  target: "test",
  kind,
  level,
  fieldNames: [""],
});

const MOCK_MAP: Map<bigint, Metadata> = new Map([[BigInt(1), MOCK_METADATA()]]);

const MOCK_UPDATE = {
  at: {
    seconds: BigInt(1),
    nanos: 0,
  },
  newMetadata: [
    {
      id: BigInt(10),
      metadata: MOCK_METADATA(Metadata_Kind.SPAN, Metadata_Level.INFO),
    },
    {
      id: BigInt(11),
      metadata: MOCK_METADATA(Metadata_Kind.EVENT, Metadata_Level.DEBUG),
    },
  ],
};

describe("Update metadata for Span Waterfalls", () => {
  it("adds all received metadata to the map accordingly.", () => {
    const updated = updateSpanMetadata(MOCK_MAP, MOCK_UPDATE);

    expect(updated.get(BigInt(10))).toEqual(
      MOCK_UPDATE.newMetadata[0].metadata
    );

    expect(updated.get(BigInt(11))).toEqual(
      MOCK_UPDATE.newMetadata[1].metadata
    );
  });
});
