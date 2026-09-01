import { Metadata } from "~/lib/proto/common";
import { Update as InstrumentUpdate } from "~/lib/proto/instrument";

export function updateSpanMetadata(
  currentMeta: Map<bigint, Metadata>,
  update: InstrumentUpdate,
) {
  return new Map([
    ...(currentMeta || []),
    ...update.newMetadata.map((new_metadata) => {
      /**
       * protobuf generated types have these as optional.
       */
      const id = new_metadata.id as bigint;
      const metadata = new_metadata.metadata as Metadata;

      return [id, metadata] as const;
    }),
  ]);
}
